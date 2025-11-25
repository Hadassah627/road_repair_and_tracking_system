# 🔄 How to Restart Backend Server

## Issue Fixed
✅ Added **Severity** field to complaint submission form
✅ Fixed `complaintId` validation issue
✅ Fixed `severity` enum validation issue

## ⚠️ IMPORTANT: You MUST Restart Backend Server!

The backend model has been updated, so you need to restart the server for changes to take effect.

## Steps to Restart Backend

### Method 1: Using Current Terminal
1. Go to the terminal where backend is running
2. Press `Ctrl + C` to stop the server
3. Wait for it to stop (you'll see the command prompt)
4. Run: `node server.js`

### Method 2: Kill Process and Restart
If you can't find the terminal or Ctrl+C doesn't work:

```bash
# Find and kill the process using port 5000
killall node
# OR more specific:
lsof -ti:5000 | xargs kill -9

# Then restart
cd /home/rguktvalley/Documents/rrts_final/backend
node server.js
```

## Expected Output After Restart

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

## What Changed

### 1. Backend Model (`backend/models/Complaint.js`)
- ✅ Removed `required: true` from `complaintId` (auto-generated)
- ✅ Changed severity default from `null` to `'low'`

### 2. Frontend Form (`frontend/src/pages/ResidentDashboard.jsx`)
- ✅ Added **Severity** dropdown field (Low/Medium/High)
- ✅ Enhanced error messages
- ✅ Added success notification

## After Restart - Test the Fix

1. Open browser: `http://localhost:3000/resident/dashboard`
2. Click "Submit New Complaint"
3. Fill the form:
   - Road Name: `nh7`
   - Location: `idupulapaya,kadapa`
   - Area Type: `Residential`
   - **Severity: `Low`** ⭐ (NEW FIELD)
   - Issue Description: `full damage`
4. Click "Submit Complaint"
5. ✅ Should see: **"Complaint submitted successfully!"**
6. ✅ Modal closes
7. ✅ New complaint appears in table

## Frontend Status
✅ **No restart needed** - Frontend hot-reloads automatically!

## Verification

### Check Backend Logs:
- Should show: `POST /api/complaints 201`

### Check Browser Console:
- Open DevTools (F12) → Console
- Should see: "Complaint submitted successfully!"

### Check Network Tab:
- DevTools → Network → Look for `/api/complaints` request
- Status: `201 Created`
- Response should include:
  ```json
  {
    "success": true,
    "data": {
      "complaintId": "CMP000001",
      "severity": "low",
      "roadName": "nh7",
      ...
    }
  }
  ```

## Still Having Issues?

If after restarting you still see errors:

1. **Check backend console** for error messages
2. **Check browser console** (F12 → Console) for errors
3. **Check Network tab** (F12 → Network) for API response
4. **Verify MongoDB is running**: `sudo systemctl status mongod`

## Quick Reference

```bash
# Stop backend (in backend terminal)
Ctrl + C

# Start backend
cd /home/rguktvalley/Documents/rrts_final/backend
node server.js

# Backend should be running on: http://localhost:5000
# Frontend should be running on: http://localhost:3000
```

---

✅ **Ready to test once backend is restarted!**
