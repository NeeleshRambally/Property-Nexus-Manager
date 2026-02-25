import React from "react";
import { Bell, CheckCircle, AlertCircle, InfoIcon, DollarSign, Wrench, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "payment" | "maintenance" | "document" | "tenant";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    message: "Rent payment of R12,500 received from John Doe for Property 123 Main Street.",
    timestamp: "2 hours ago",
    isRead: false
  },
  {
    id: "2",
    type: "maintenance",
    title: "Maintenance Request",
    message: "New maintenance request submitted for broken water heater at 456 Oak Avenue.",
    timestamp: "5 hours ago",
    isRead: false
  },
  {
    id: "3",
    type: "tenant",
    title: "New Tenant Application",
    message: "Sarah Smith has submitted an application for 789 Pine Street. Review documents now.",
    timestamp: "1 day ago",
    isRead: true
  },
  {
    id: "4",
    type: "document",
    title: "Document Uploaded",
    message: "Tenant Michael Johnson uploaded proof of employment for 321 Elm Drive.",
    timestamp: "1 day ago",
    isRead: true
  },
  {
    id: "5",
    type: "warning",
    title: "Lease Expiring Soon",
    message: "Lease agreement for 456 Oak Avenue expires in 30 days. Time to renew or list property.",
    timestamp: "2 days ago",
    isRead: true
  },
  {
    id: "6",
    type: "success",
    title: "Property Listed Successfully",
    message: "Your property at 999 Maple Court has been successfully listed as available.",
    timestamp: "3 days ago",
    isRead: true
  },
  {
    id: "7",
    type: "info",
    title: "System Update",
    message: "RentAssured has been updated with new features. Check out the changelog for details.",
    timestamp: "5 days ago",
    isRead: true
  },
  {
    id: "8",
    type: "payment",
    title: "Payment Overdue",
    message: "Rent payment for 123 Main Street is 5 days overdue. Follow up with tenant.",
    timestamp: "1 week ago",
    isRead: true
  }
];

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "payment":
      return <DollarSign className="w-5 h-5" />;
    case "maintenance":
      return <Wrench className="w-5 h-5" />;
    case "document":
      return <FileText className="w-5 h-5" />;
    case "tenant":
      return <User className="w-5 h-5" />;
    case "success":
      return <CheckCircle className="w-5 h-5" />;
    case "warning":
      return <AlertCircle className="w-5 h-5" />;
    case "info":
      return <InfoIcon className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getIconColor = (type: Notification["type"]) => {
  switch (type) {
    case "payment":
      return "text-emerald-500 bg-emerald-500/10";
    case "maintenance":
      return "text-orange-500 bg-orange-500/10";
    case "document":
      return "text-blue-500 bg-blue-500/10";
    case "tenant":
      return "text-purple-500 bg-purple-500/10";
    case "success":
      return "text-green-500 bg-green-500/10";
    case "warning":
      return "text-yellow-500 bg-yellow-500/10";
    case "info":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>(dummyNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Notifications</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Stay updated with your property management activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full" variant={unreadCount > 0 ? "default" : "secondary"}>
            {unreadCount} Unread
          </Badge>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden transition-all cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${
              !notification.isRead ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
