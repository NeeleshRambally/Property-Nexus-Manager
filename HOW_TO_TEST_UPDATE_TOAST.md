# How to Test the Update Notification Toast

## Method 1: Quick Test (Using Test Page)

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser to: `http://localhost:3001/test-update-toast`

3. Click the "Show Update Toast" button

4. You'll see the toast appear with a "Refresh" button!

---

## Method 2: Real-World Test (Actual Build Detection)

This simulates what happens when you deploy a new version.

### Step-by-Step:

1. **Start the app in dev mode:**
   ```bash
   npm run dev
   ```

2. **Open the app in your browser:**
   - Go to: `http://localhost:3001`
   - Log in if needed
   - Open browser DevTools (F12 or Right-click → Inspect)
   - Go to the Console tab

3. **Watch the console - you'll see:**
   ```
   [Version Check] Build hash stored: [some hash like "CwWxtCRB"]
   ```

4. **In a NEW terminal window (keep the app running), build the app:**
   ```bash
   npm run build
   ```

5. **Wait 30 seconds (or less)**
   - The app checks for updates every 30 seconds
   - Watch the console - you'll see:
   ```
   [Version Check] New build detected! Old: CwWxtCRB New: [new hash]
   ```

6. **The toast will appear automatically!**
   - Title: "Update Available"
   - Description: "A new version of the app is available."
   - Button: "Refresh"

7. **Click the "Refresh" button**
   - The page will reload with the new version

---

## How It Works

The version check system:
1. ✅ Runs automatically every 30 seconds
2. ✅ Fetches the index.html file
3. ✅ Extracts the build hash from the script tag (e.g., `/assets/main-ABC123.js`)
4. ✅ Compares it to the stored hash
5. ✅ If different → shows the toast notification
6. ✅ User clicks "Refresh" → page reloads with new version

---

## Troubleshooting

**Toast doesn't appear?**
- Check console for errors
- Make sure you're in dev mode (`npm run dev`)
- Ensure 30 seconds have passed after running `npm run build`
- Check that the build actually changed files (look for different hash in console)

**Want to test faster?**
- Change `VERSION_CHECK_INTERVAL` in `client/src/hooks/useVersionCheck.ts`
- Currently set to `30 * 1000` (30 seconds)
- Can temporarily change to `5 * 1000` (5 seconds) for testing

---

## Production Behavior

In production, when you deploy a new version:
1. Users keep browsing normally
2. Every 30 seconds, their browser checks for updates
3. When they detect the new version, the toast appears
4. They click "Refresh" when ready
5. They get the new version instantly - no need to close/reopen tab!
