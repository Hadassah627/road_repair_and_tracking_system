# Complaint Scheduling → Support Person Workflow

## Overview
Complete workflow implementation where supervisors schedule complaints and automatically create work assignments for support persons. Support persons can then track and update the work status.

## Workflow Process

### Step 1: Supervisor Schedules Complaint
1. Supervisor logs in and assesses complaints
2. After assessment and resource approval, supervisor clicks "Schedule" button
3. In the schedule modal, supervisor:
   - Sets schedule date
   - **Selects a support person** from dropdown (optional)
   - If support person selected:
     - Enters work description
     - Sets work deadline
     - Chooses priority (low/medium/high)
   - Adds schedule notes

### Step 2: Automatic Work Assignment Creation
When supervisor submits the schedule:
- Complaint status changes to "scheduled"
- **If support person is selected:**
  - System automatically creates a WorkAssignment record
  - Links complaint to support person
  - Sets deadline, priority, and work description
  - Notifies support person

### Step 3: Support Person Receives Assignment
- Support person logs in to their dashboard
- Sees new work assignment in the list
- Can view full details including:
  - Complaint information
  - Work description
  - Deadline
  - Priority
  - Supervisor contact details

### Step 4: Support Person Updates Status
- Support person can update work status to:
  - **In Progress** - When starting the work
  - **Completed** - When work is finished
- System automatically tracks timestamps:
  - `startedAt` - When marked in-progress
  - `completedAt` - When marked completed
- Can add notes about the work

### Step 5: Tracking and Monitoring
- Supervisor can view all assigned work and their status
- Support person sees statistics:
  - Total tasks
  - Pending tasks
  - In-progress tasks
  - Completed tasks
- Color-coded status badges for quick identification
- Overdue warnings for missed deadlines

## Backend Changes

### 1. Updated Complaint Model
**File:** `backend/models/Complaint.js`
```javascript
assignedSupportPerson: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}
```
- Added reference to support person assigned to the complaint

### 2. Updated complaintController.scheduleComplaint
**File:** `backend/controllers/complaintController.js`

**New Request Body Parameters:**
```javascript
{
  scheduleDate: Date,
  scheduleNotes: String,
  assignedSupportPerson: ObjectId,  // NEW - Support person ID
  workDescription: String,           // NEW - Work description
  deadline: Date,                    // NEW - Work deadline
  priority: String                   // NEW - Work priority
}
```

**New Functionality:**
- Imports WorkAssignment model
- Accepts support person assignment in request
- Automatically creates WorkAssignment if support person is selected
- Returns work assignment details in response
- Populates support person information

**Response Structure:**
```javascript
{
  success: true,
  message: "Complaint scheduled successfully! Work assigned to support person.",
  data: { /* complaint with assignedSupportPerson populated */ },
  workAssignment: {
    _id: "...",
    complaintId: "...",
    assignedTo: {
      name: "Support Person Name",
      email: "support@example.com",
      phone: "555-0100"
    },
    assignedBy: { /* supervisor details */ },
    workDescription: "...",
    roadName: "...",
    location: "...",
    deadline: "...",
    priority: "high",
    status: "pending"
  },
  notification: { /* notification details */ }
}
```

### 3. New Auth Controller Method
**File:** `backend/controllers/authController.js`

**Method:** `getSupportPersons()`
```javascript
// @desc    Get all support persons
// @route   GET /api/auth/support-persons
// @access  Private (Supervisor, Administrator)
```

**Purpose:** Fetch all users with role 'support' for assignment dropdown

**Response:**
```javascript
{
  success: true,
  count: 3,
  data: [
    {
      _id: "...",
      name: "Support Person 1",
      email: "support1@example.com",
      phone: "555-0100",
      area: "District 1"
    }
  ]
}
```

### 4. Updated Auth Routes
**File:** `backend/routes/auth.js`
```javascript
router.get('/support-persons', protect, authorize('supervisor', 'administrator'), getSupportPersons);
```

## Frontend Changes

### 1. Updated API Services
**File:** `frontend/src/services/api.js`

Added:
```javascript
authAPI.getSupportPersons() // Fetch all support persons
```

### 2. Updated SupervisorDashboard
**File:** `frontend/src/pages/SupervisorDashboard.jsx`

**New State:**
```javascript
const [supportPersons, setSupportPersons] = useState([]);
const [scheduleData, setScheduleData] = useState({
  scheduleDate: '',
  scheduleNotes: '',
  assignedSupportPerson: '',  // NEW
  workDescription: '',         // NEW
  deadline: '',                // NEW
  priority: 'medium'          // NEW
});
```

**New Function:**
```javascript
const fetchSupportPersons = async () => {
  const response = await authAPI.getSupportPersons();
  setSupportPersons(response.data.data);
};
```

**Updated Schedule Modal:**
- Dropdown to select support person
- Conditional fields shown when support person is selected:
  - Work Description (required)
  - Work Deadline (required)
  - Priority (required)
- Dynamic notification message
- Shows work assignment confirmation

**UI Features:**
- Support person dropdown with name and email
- Conditional rendering of work assignment fields
- Default deadline set to 7 days from now
- Priority dropdown (low/medium/high)
- Visual feedback showing work assignment will be created
- Enhanced success message with work assignment details

### 3. SupportDashboard (Already Created)
**File:** `frontend/src/pages/SupportDashboard.jsx`

Displays all assigned work and allows status updates.

## Database Schema

### WorkAssignment Collection
```javascript
{
  _id: ObjectId,
  complaintId: ObjectId (ref: Complaint),
  assignedTo: ObjectId (ref: User - Support Person),
  assignedBy: ObjectId (ref: User - Supervisor),
  workDescription: String,
  roadName: String,
  location: String,
  deadline: Date,
  status: "pending" | "in-progress" | "completed",
  priority: "low" | "medium" | "high",
  notes: String,
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date
}
```

## API Endpoints

### Schedule Complaint with Support Assignment
```http
PUT /api/complaints/:id/schedule
Authorization: Bearer <supervisor_token>
Content-Type: application/json

Request Body:
{
  "scheduleDate": "2025-11-20T00:00:00.000Z",
  "scheduleNotes": "Road repair scheduled for next week",
  "assignedSupportPerson": "673abc123...",
  "workDescription": "Fill potholes and resurface 50m section",
  "deadline": "2025-11-27T00:00:00.000Z",
  "priority": "high"
}

Response:
{
  "success": true,
  "message": "Complaint scheduled successfully! Work assigned to support person.",
  "data": { /* complaint object */ },
  "workAssignment": { /* work assignment object */ },
  "notification": { /* notification details */ }
}
```

### Get Support Persons
```http
GET /api/auth/support-persons
Authorization: Bearer <supervisor_token>

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "673abc...",
      "name": "Support Person 1",
      "email": "support1@example.com",
      "phone": "555-0100",
      "area": "District 1"
    }
  ]
}
```

### Get My Work Assignments (Support Person)
```http
GET /api/work-assignments
Authorization: Bearer <support_token>

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "complaintId": {
        "complaintId": "CMP-001",
        "description": "..."
      },
      "workDescription": "Fill potholes",
      "roadName": "Main Street",
      "location": "Near City Hall",
      "deadline": "2025-11-27T00:00:00.000Z",
      "status": "pending",
      "priority": "high",
      "assignedBy": {
        "name": "Supervisor Name",
        "email": "supervisor@example.com",
        "phone": "555-0200"
      }
    }
  ]
}
```

### Update Work Status (Support Person)
```http
PUT /api/work-assignments/:id/status
Authorization: Bearer <support_token>
Content-Type: application/json

Request Body:
{
  "status": "in-progress",
  "notes": "Started working on Main Street pothole"
}

Response:
{
  "success": true,
  "message": "Work status updated to in-progress",
  "data": { /* updated work assignment */ }
}
```

## Complete Workflow Example

### 1. Create Support Person User
```bash
POST /api/auth/register
{
  "name": "John Worker",
  "email": "john@example.com",
  "password": "password123",
  "role": "support",
  "phone": "555-0300"
}
```

### 2. Supervisor Assesses Complaint
```bash
PUT /api/complaints/:id/assess
{
  "severity": "high",
  "areaType": "commercial",
  "supervisorNotes": "Major pothole requires immediate attention",
  "resourceEstimate": {
    "materials": [{"name": "Asphalt", "quantity": 100, "unit": "kg"}],
    "manpower": {"workers": 3, "engineers": 1}
  }
}
```

### 3. Administrator Approves Resources
```bash
PUT /api/complaints/:id/approve-resources
{
  "resourcesAllocated": {
    "materials": [{"name": "Asphalt", "quantity": 100, "unit": "kg"}],
    "manpower": {"workers": 3, "engineers": 1}
  },
  "administratorNotes": "Resources approved"
}
```

### 4. Supervisor Schedules & Assigns Support
```bash
PUT /api/complaints/:id/schedule
{
  "scheduleDate": "2025-11-20T00:00:00.000Z",
  "assignedSupportPerson": "673abc...", // John's ID
  "workDescription": "Fill pothole on Main Street with approved asphalt",
  "deadline": "2025-11-25T00:00:00.000Z",
  "priority": "high",
  "scheduleNotes": "Work must be completed before weekend traffic"
}
```

### 5. Support Person Views Assignment
- Login as support person
- See new work assignment in dashboard
- Status: "pending"

### 6. Support Person Updates Status
```bash
PUT /api/work-assignments/:id/status
{
  "status": "in-progress",
  "notes": "Started work at 9:00 AM"
}
```

### 7. Support Person Completes Work
```bash
PUT /api/work-assignments/:id/status
{
  "status": "completed",
  "notes": "Pothole filled successfully. Used 95kg asphalt."
}
```

## Testing Checklist

- [ ] Create a support person user
- [ ] Login as supervisor
- [ ] Assess a complaint
- [ ] Get resource approval
- [ ] Schedule complaint without support person assignment
- [ ] Schedule complaint WITH support person assignment
- [ ] Verify work assignment was created
- [ ] Login as support person
- [ ] View assigned work in dashboard
- [ ] Update work status to "in-progress"
- [ ] Update work status to "completed"
- [ ] Verify timestamps are recorded correctly
- [ ] Check supervisor can see work assignment status

## Benefits

1. **Automated Assignment:** No manual work assignment creation needed
2. **Single Action:** Supervisor schedules and assigns in one step
3. **Real-time Tracking:** Support person sees work immediately
4. **Status Visibility:** Supervisor can monitor work progress
5. **Accountability:** Clear assignment and timestamp tracking
6. **Flexible:** Can schedule without support person if needed
7. **Integrated:** Part of the complaint workflow, not separate

## Next Steps

1. **Notifications:** Add email/SMS notifications when work is assigned
2. **Mobile App:** Support persons can update status from field
3. **Photo Upload:** Support persons can upload completion photos
4. **GPS Tracking:** Track support person location during work
5. **Performance Metrics:** Track completion rates and efficiency
6. **In-app Chat:** Direct communication between supervisor and support
7. **Work History:** View past completed work for support persons
8. **Bulk Assignment:** Assign multiple complaints to one support person

## Security

- Only supervisors and administrators can see support persons list
- Only supervisors can create work assignments (via scheduling)
- Support persons can only view their own assignments
- Support persons can only update status of assigned work
- All endpoints require authentication
- Role-based authorization enforced

## Conclusion

The workflow is now complete! When a supervisor schedules a complaint:
1. ✅ Complaint is marked as "scheduled"
2. ✅ If support person selected → Work assignment automatically created
3. ✅ Support person receives assignment in their dashboard
4. ✅ Support person can track and update work status
5. ✅ Supervisor can monitor progress
6. ✅ Resident is notified of scheduling

This creates a seamless workflow from complaint submission → assessment → approval → scheduling → assignment → execution → completion. 🎉
