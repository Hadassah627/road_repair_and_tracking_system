# Supervisor Dashboard - Complaint Visibility Fix

## Issue
When residents submit complaints, they were **not appearing** in the Supervisor Dashboard. The dashboard showed "No data available" even though complaints existed in the database.

## Root Cause
The backend controller was filtering complaints for supervisors to only show complaints where `supervisorId` matched the logged-in supervisor. However:

1. **New complaints** don't have a `supervisorId` (it's `null` or doesn't exist)
2. Supervisors should see **ALL pending/unassigned complaints** to review and assess them
3. Only **after assessment** should the complaint be assigned to that supervisor

### Previous Logic (BROKEN)
```javascript
if (req.user.role === 'supervisor') {
  // Only showed complaints already assigned to this supervisor
  query.supervisorId = req.user.id;
}
```

**Problem:** New complaints have `supervisorId = null`, so they were hidden!

## Solution Applied

### Updated Logic (FIXED)
**File:** `backend/controllers/complaintController.js`

```javascript
if (req.user.role === 'supervisor') {
  // Supervisor sees all pending complaints + complaints assigned to them
  query.$or = [
    { supervisorId: req.user.id },           // Assigned to this supervisor
    { supervisorId: null },                   // Unassigned complaints
    { supervisorId: { $exists: false } }      // Complaints without supervisorId field
  ];
}
```

### What Changed
✅ Supervisors now see:
1. **Unassigned complaints** (supervisorId is null or doesn't exist)
2. **Their own assigned complaints** (supervisorId matches their ID)

## How It Works Now

### Workflow

1. **Resident submits complaint**
   - Complaint is created with `supervisorId: null`
   - Status: `pending`
   - Severity: Set by resident (low/medium/high)

2. **Supervisor Dashboard**
   - ✅ **Now shows the new complaint!**
   - Supervisor clicks "Assess" to review it
   - Supervisor sets severity, area type, resources needed
   - Supervisor adds notes

3. **After Assessment**
   - Complaint gets assigned to that supervisor (`supervisorId` is set)
   - Priority is calculated automatically
   - Status remains `pending` until scheduled

4. **Auto Schedule**
   - Supervisor can click "Auto Schedule" button
   - System schedules all assessed complaints
   - Status changes to `scheduled`

## Testing Steps

### 1. Submit a Complaint as Resident
1. Login as **resident**
2. Go to Resident Dashboard
3. Click "Submit New Complaint"
4. Fill form:
   - Road Name: "Test Road"
   - Location: "Test Location"
   - Area Type: "Residential"
   - Severity: "Low"
   - Description: "Test complaint"
5. Submit

### 2. View in Supervisor Dashboard
1. Logout (or open in new incognito window)
2. Login as **supervisor**
3. Go to Supervisor Dashboard
4. ✅ **Should see the new complaint in the table!**

### 3. Assess the Complaint
1. Click "Assess" button on the complaint
2. Review details
3. Set severity (if needed)
4. Add workers/engineers required
5. Add supervisor notes
6. Click "Submit Assessment"
7. ✅ Complaint is now assigned to this supervisor

### 4. Verify Stats
Check the dashboard stats:
- **Pending Review**: Should show count of unassessed complaints
- **Assessed**: Should show count after assessment
- **Scheduled**: Shows after auto-schedule
- **In Progress**: Shows when work starts

## Backend Restart Required ⚠️

The backend server was already restarted with the fix. Frontend will automatically reload.

**Current Status:**
- ✅ Backend: Running on port 5000 (with fix)
- ✅ Frontend: Running on port 3000 (no changes needed)

## Verification

### Expected Behavior
1. **Resident submits complaint** → Appears immediately in Supervisor Dashboard
2. **Supervisor assesses complaint** → Gets assigned to that supervisor
3. **Supervisor views again** → Still sees it (because it's assigned to them)

### Check Database
You can verify in MongoDB:

```javascript
// New complaints (visible to all supervisors)
{ supervisorId: null, status: 'pending' }

// Assessed complaints (visible to assigned supervisor)
{ supervisorId: ObjectId('...'), status: 'pending' }
```

## Related Files Modified

- ✅ `backend/controllers/complaintController.js` - Fixed supervisor query filter

## Status
✅ **FIXED** - Supervisors can now see all pending/unassigned complaints!

## Next Steps

1. Refresh the Supervisor Dashboard (F5 or reload page)
2. Submit a test complaint as resident
3. Should appear immediately in supervisor dashboard
4. Try assessing it to verify full workflow

---

**Ready to test!** Just refresh your Supervisor Dashboard browser tab.
