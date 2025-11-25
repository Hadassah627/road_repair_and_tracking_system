# Testing Guide: Supervisor Schedule → Support Person Assignment

## Overview
This guide shows how to test the complete workflow from scheduling a complaint to seeing the work assignment in the support person's dashboard.

## Prerequisites
- Backend running on port 5000 ✅
- Frontend running on port 3000 ✅
- MongoDB connected ✅

## Step-by-Step Testing

### Step 1: Create Support Person Account
1. Go to Landing Page: `http://localhost:3000`
2. Click "Register"
3. Fill in the form:
   - **Name**: John Worker
   - **Email**: support1@example.com
   - **Password**: password123
   - **Role**: Support
   - **Phone**: 555-0100
4. Click "Register"
5. **Logout** after registration

### Step 2: Create/Login as Resident
1. Login as a resident account
2. Submit a new complaint:
   - Road Name: Main Street
   - Location: Near City Hall
   - Description: Large pothole needs repair
   - Severity: High
3. Submit the complaint
4. Logout

### Step 3: Login as Supervisor
1. Select "Supervisor" role on landing page
2. Login with supervisor credentials
3. You should see the new complaint in your dashboard

### Step 4: Assess the Complaint
1. Click "View" on the complaint
2. Fill in assessment details:
   - Severity: High
   - Area Type: Commercial
   - Priority: 8
   - Resource Estimate:
     - Materials: Asphalt, 100 kg
     - Machines: Road roller, 1
     - Manpower: Workers: 3, Engineers: 1
   - Supervisor Notes: "Urgent repair required"
3. Click "Submit Assessment"
4. Complaint status changes to "pending" (waiting for resource approval)

### Step 5: Login as Administrator
1. Logout from supervisor
2. Login as administrator
3. Go to "Resource Requests" tab
4. Click "Review" on the pending request
5. Approve the resources:
   - Allocate requested resources
   - Add administrator notes: "Resources approved"
6. Click "Approve Resources"

### Step 6: Schedule with Support Person Assignment
1. Logout and login back as **Supervisor**
2. Find the approved complaint (green "Approved" badge in Resource Status)
3. Click the green "Schedule" button
4. In the Schedule Modal:
   - **Schedule Date**: Select tomorrow's date
   - **Assign to Support Person**: Select "John Worker (support1@example.com)"
   - **Work Description**: "Fill pothole on Main Street with asphalt"
   - **Work Deadline**: Select date 7 days from now
   - **Priority**: High
   - **Schedule Notes**: "Use safety equipment, work in morning hours"
5. Click "Schedule Complaint"
6. You should see a success message with:
   - Complaint scheduled
   - Work assignment created
   - Support person details
   - Resident notified

### Step 7: Verify in Supervisor Dashboard
1. After scheduling, check the complaints table
2. You should see a new "Assigned To" column
3. The scheduled complaint should show:
   - 🔧 John Worker
   - support1@example.com

### Step 8: Login as Support Person
1. Logout from supervisor
2. Go to landing page
3. Select "Support Person" role (🔧 icon)
4. Login with:
   - Email: support1@example.com
   - Password: password123
5. You should be redirected to Support Dashboard

### Step 9: View Work Assignment
In the Support Person Dashboard, you should see:

**Statistics:**
- Total Tasks: 1
- Pending: 1
- In Progress: 0
- Completed: 0

**Work Assignments Table:**
| Work ID | Road/Location | Description | Priority | Deadline | Status | Actions |
|---------|---------------|-------------|----------|----------|--------|---------|
| CMP-XXX | Main Street<br>Near City Hall | Fill pothole... | HIGH | [Date] | pending | View Details, Update Status |

### Step 10: View Assignment Details
1. Click "View Details" button
2. Modal should show:
   - Work ID
   - Status badge
   - Road Name: Main Street
   - Location: Near City Hall
   - Work Description: Fill pothole on Main Street with asphalt
   - Priority: HIGH (in red)
   - Deadline: [Date]
   - **Assigned By (Supervisor):**
     - Name: [Supervisor Name]
     - Email: [Supervisor Email]
     - Phone: [Supervisor Phone]
   - Notes: Use safety equipment, work in morning hours
   - Timestamps: Assigned date

### Step 11: Update Work Status to In-Progress
1. Click "Update Status" button
2. In the modal:
   - Select status: **In Progress**
   - Add notes: "Started work at 9:00 AM. Preparing the area."
3. Click "Update Status"
4. Success message appears
5. Dashboard refreshes:
   - Total Tasks: 1
   - Pending: 0
   - **In Progress: 1** ✅
   - Completed: 0
6. Status badge in table changes to blue "in-progress"

### Step 12: Complete the Work
1. Click "Update Status" again
2. In the modal:
   - Select status: **Completed**
   - Add notes: "Pothole filled successfully. Used 95kg asphalt. Area marked for 24 hours."
3. Click "Update Status"
4. Success message appears
5. Dashboard refreshes:
   - Total Tasks: 1
   - Pending: 0
   - In Progress: 0
   - **Completed: 1** ✅
6. Status badge changes to green "completed"
7. "Update Status" button is removed (work is done)

### Step 13: Verify Supervisor Can See Status
1. Logout from support person
2. Login as Supervisor
3. Check the complaints table
4. The "Assigned To" column should still show John Worker
5. You can also check work assignments (future feature)

## Expected Results

✅ **Support Person Dashboard Statistics:**
- Correctly shows count of tasks
- Updates in real-time when status changes
- Color-coded cards (yellow/blue/green)

✅ **Work Assignments Table:**
- Shows all assigned work
- Priority color-coded (red=high, yellow=medium, green=low)
- Overdue warning if deadline passed
- Status badges with correct colors
- Action buttons based on status

✅ **Details Modal:**
- Complete work information
- Supervisor contact details visible
- Notes and timestamps shown
- Professional layout

✅ **Status Update Modal:**
- Dropdown with in-progress/completed options
- Notes field working
- Updates reflect immediately
- Timestamps recorded (startedAt, completedAt)

✅ **Supervisor Dashboard:**
- "Assigned To" column shows support person
- Name and email displayed
- 🔧 icon for easy identification

## Troubleshooting

### Issue: Support person doesn't see any assignments
**Solution:**
1. Check that backend server is running
2. Verify support person is logged in with correct account
3. Check browser console for errors
4. Verify complaint was scheduled with support person assigned

### Issue: "Assigned To" column not showing in Supervisor Dashboard
**Solution:**
1. Refresh the page
2. Check that backend is updated and running
3. Clear browser cache

### Issue: Status update not working
**Solution:**
1. Check browser console for errors
2. Verify API endpoint `/api/work-assignments/:id/status` is accessible
3. Check that support person owns the work assignment

### Issue: Work assignment not created
**Solution:**
1. Verify support person was selected in schedule modal
2. Check backend logs for errors
3. Ensure all required fields were filled

## API Verification

You can also test using API calls:

### Get Support Person's Assignments
```bash
# Get token from login
curl -X GET http://localhost:5000/api/work-assignments \
  -H "Authorization: Bearer YOUR_SUPPORT_TOKEN"
```

### Update Work Status
```bash
curl -X PUT http://localhost:5000/api/work-assignments/ASSIGNMENT_ID/status \
  -H "Authorization: Bearer YOUR_SUPPORT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "notes": "Started work"
  }'
```

## Success Criteria

The workflow is working correctly if:

1. ✅ Supervisor can select support person when scheduling
2. ✅ Work assignment is automatically created
3. ✅ Support person sees assignment in dashboard immediately
4. ✅ Support person can view full details including supervisor contact
5. ✅ Support person can update status to in-progress
6. ✅ Support person can update status to completed
7. ✅ Statistics update in real-time
8. ✅ Timestamps are recorded correctly
9. ✅ Supervisor can see who is assigned in their dashboard
10. ✅ All data persists after page refresh

## Notes

- Default deadline is 7 days from schedule date
- Priority is inherited from complaint severity if not specified
- Work description defaults to complaint description if not provided
- Support person assignment is optional - can schedule without it
- Once work is completed, status cannot be changed back
- Overdue warnings appear in red if deadline has passed

## Next Steps After Testing

1. Test with multiple support persons
2. Test bulk assignment scenarios
3. Test edge cases (missing fields, invalid data)
4. Test concurrent updates
5. Verify email notifications (if implemented)
6. Test on mobile devices
7. Performance test with many assignments
