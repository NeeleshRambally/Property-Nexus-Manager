# Push Notification Backend Implementation Guide

## Overview
Your C# backend needs to store push notification subscriptions and send web push notifications to users.

---

## 1. VAPID Keys (SAVE THESE!)

**Public Key** (add to frontend):
```
BNc72Bo0wXVZzlQzjcHBErK0gWEz4T37Bx6e99U8OvidV3WmsxRJjPPTL40S_fT-sdSOikATZ0ia1ByFQgkso5Y
```

**Private Key** (keep secret in backend):
```
Nb7bkzXGe2-Lj_bqA8FxBHh_HytslUgWmyOcLioZKL4
```

⚠️ **Store the private key in appsettings.json or environment variables - NEVER commit to git!**

---

## 2. NuGet Package Required

Install the Web Push library for C#:
```bash
dotnet add package WebPush
```

---

## 3. MongoDB Model for Subscriptions

Create a model to store user subscriptions:

```csharp
// Models/PushSubscription.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class PushSubscription
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    public string LandlordIdNumber { get; set; }

    public string Endpoint { get; set; }

    public string P256dh { get; set; }  // Encryption key

    public string Auth { get; set; }    // Auth secret

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

---

## 4. API Endpoints Needed

### **A. Subscribe Endpoint** (Store subscription from frontend)

```csharp
// Controllers/NotificationsController.cs
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly IMongoCollection<PushSubscription> _subscriptions;

    public NotificationsController(IMongoDatabase database)
    {
        _subscriptions = database.GetCollection<PushSubscription>("pushSubscriptions");
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
    {
        var subscription = new PushSubscription
        {
            LandlordIdNumber = request.LandlordIdNumber,
            Endpoint = request.Subscription.Endpoint,
            P256dh = request.Subscription.Keys.P256dh,
            Auth = request.Subscription.Keys.Auth
        };

        // Check if subscription already exists
        var existing = await _subscriptions.Find(s =>
            s.Endpoint == subscription.Endpoint).FirstOrDefaultAsync();

        if (existing != null)
        {
            return Ok(new { message = "Already subscribed" });
        }

        await _subscriptions.InsertOneAsync(subscription);
        return Ok(new { message = "Subscribed successfully" });
    }

    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequest request)
    {
        await _subscriptions.DeleteOneAsync(s => s.Endpoint == request.Endpoint);
        return Ok(new { message = "Unsubscribed successfully" });
    }
}

// Request models
public class SubscribeRequest
{
    public string LandlordIdNumber { get; set; }
    public SubscriptionData Subscription { get; set; }
}

public class SubscriptionData
{
    public string Endpoint { get; set; }
    public KeysData Keys { get; set; }
}

public class KeysData
{
    public string P256dh { get; set; }
    public string Auth { get; set; }
}

public class UnsubscribeRequest
{
    public string Endpoint { get; set; }
}
```

---

### **B. Send Notification Method** (Send push to users)

```csharp
// Services/PushNotificationService.cs
using WebPush;

public class PushNotificationService
{
    private readonly IMongoCollection<PushSubscription> _subscriptions;
    private readonly string _publicKey;
    private readonly string _privateKey;

    public PushNotificationService(IMongoDatabase database, IConfiguration config)
    {
        _subscriptions = database.GetCollection<PushSubscription>("pushSubscriptions");
        _publicKey = config["VapidKeys:PublicKey"];
        _privateKey = config["VapidKeys:PrivateKey"];
    }

    public async Task SendNotificationToLandlord(string landlordIdNumber, string title, string body, string url = "/")
    {
        // Get all subscriptions for this landlord
        var subscriptions = await _subscriptions
            .Find(s => s.LandlordIdNumber == landlordIdNumber)
            .ToListAsync();

        if (subscriptions.Count == 0)
        {
            Console.WriteLine($"No subscriptions found for landlord {landlordIdNumber}");
            return;
        }

        var payload = new
        {
            title = title,
            body = body,
            icon = "/favicon.png",
            badge = "/favicon.png",
            data = new { url = url }
        };

        var payloadJson = System.Text.Json.JsonSerializer.Serialize(payload);

        var vapidDetails = new VapidDetails(
            "mailto:support@rentassured.com", // Your email
            _publicKey,
            _privateKey
        );

        var webPushClient = new WebPushClient();

        foreach (var subscription in subscriptions)
        {
            try
            {
                var pushSubscription = new WebPush.PushSubscription(
                    subscription.Endpoint,
                    subscription.P256dh,
                    subscription.Auth
                );

                await webPushClient.SendNotificationAsync(
                    pushSubscription,
                    payloadJson,
                    vapidDetails
                );

                Console.WriteLine($"Notification sent to {subscription.Endpoint}");
            }
            catch (WebPushException ex)
            {
                Console.WriteLine($"Failed to send notification: {ex.Message}");

                // If subscription is expired or invalid, remove it
                if (ex.StatusCode == System.Net.HttpStatusCode.Gone)
                {
                    await _subscriptions.DeleteOneAsync(s => s.Id == subscription.Id);
                }
            }
        }
    }

    public async Task SendNotificationToAll(string title, string body, string url = "/")
    {
        var subscriptions = await _subscriptions.Find(_ => true).ToListAsync();

        foreach (var subscription in subscriptions)
        {
            await SendNotificationToLandlord(subscription.LandlordIdNumber, title, body, url);
        }
    }
}
```

---

## 5. Configuration (appsettings.json)

Add VAPID keys to your configuration:

```json
{
  "VapidKeys": {
    "PublicKey": "BNc72Bo0wXVZzlQzjcHBErK0gWEz4T37Bx6e99U8OvidV3WmsxRJjPPTL40S_fT-sdSOikATZ0ia1ByFQgkso5Y",
    "PrivateKey": "Nb7bkzXGe2-Lj_bqA8FxBHh_HytslUgWmyOcLioZKL4"
  }
}
```

⚠️ **In production, use environment variables instead of appsettings.json!**

---

## 6. Register Service in Program.cs

```csharp
builder.Services.AddSingleton<PushNotificationService>();
```

---

## 7. Example Usage

### **Send notification when tenant requests screening:**

```csharp
// In your VettingController.cs
[HttpPost("request")]
public async Task<IActionResult> RequestVetting([FromBody] VettingRequest request)
{
    // ... your existing vetting logic ...

    // Send push notification to landlord
    await _pushNotificationService.SendNotificationToLandlord(
        request.LandlordIdNumber,
        "New Screening Request",
        $"Tenant {request.TenantEmail} requested screening",
        "/tenants"
    );

    return Ok(vettingRecord);
}
```

### **Send notification when property status changes:**

```csharp
await _pushNotificationService.SendNotificationToLandlord(
    landlordIdNumber,
    "Property Status Updated",
    $"Property at {property.Address} is now {property.Status}",
    $"/properties/{property.Id}"
);
```

---

## 8. Testing with Postman

### **Test Subscribe Endpoint:**
```
POST http://localhost:5087/api/notifications/subscribe
Content-Type: application/json

{
  "landlordIdNumber": "123456789",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BLc4xRzKlKORKWlbdgFaBkXwKEMt...",
      "auth": "5I2Bu2oKdJ7b..."
    }
  }
}
```

### **Test Send Notification (add this endpoint for testing):**
```csharp
[HttpPost("test")]
public async Task<IActionResult> TestNotification([FromQuery] string landlordIdNumber)
{
    await _pushNotificationService.SendNotificationToLandlord(
        landlordIdNumber,
        "Test Notification",
        "This is a test notification from RentAssured",
        "/"
    );
    return Ok(new { message = "Test notification sent" });
}
```

---

## Summary

**Backend needs to:**
1. ✅ Install `WebPush` NuGet package
2. ✅ Store VAPID keys securely
3. ✅ Create `PushSubscription` model
4. ✅ Add `/api/notifications/subscribe` endpoint
5. ✅ Create `PushNotificationService` to send notifications
6. ✅ Call `SendNotificationToLandlord()` when events happen

**Frontend automatically:**
- Requests permission
- Subscribes to push
- Sends subscription to backend (you need to add this API call)
- Displays notifications

---

## Next Steps

1. Implement the backend endpoints above
2. Update frontend to call `/api/notifications/subscribe` after getting subscription
3. Test with the test page: `http://localhost:5000/test-notification.html`
4. Add notification triggers to your business logic (vetting requests, property updates, etc.)
