# RRTS API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "resident",
  "phone": "+1234567890",
  "area": "Downtown" // Required only for supervisors
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

### Get Current User
**GET** `/auth/me`

Get currently logged-in user details.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident"
  }
}
```

---

## Complaints

### Get All Complaints
**GET** `/complaints`

Get all complaints (filtered by user role).

**Headers:** Authorization required

**Query Parameters:**
- `status` - Filter by status (pending, scheduled, in-progress, completed)
- `severity` - Filter by severity (low, medium, high)
- `areaType` - Filter by area type

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5a",
      "complaintId": "CMP000001",
      "roadName": "Main Street",
      "location": {
        "address": "123 Main St, Downtown"
      },
      "description": "Large pothole causing issues",
      "severity": "high",
      "areaType": "commercial",
      "priority": 10,
      "status": "pending",
      "dateRaised": "2024-11-09T10:00:00.000Z"
    }
  ]
}
```

### Get Single Complaint
**GET** `/complaints/:id`

Get details of a specific complaint.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f5a",
    "complaintId": "CMP000001",
    "roadName": "Main Street",
    "location": {
      "address": "123 Main St, Downtown"
    },
    "description": "Large pothole causing issues",
    "severity": "high",
    "areaType": "commercial",
    "priority": 10,
    "status": "pending",
    "submittedBy": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "supervisorId": null,
    "resourceEstimate": null,
    "dateRaised": "2024-11-09T10:00:00.000Z"
  }
}
```

### Create Complaint
**POST** `/complaints`

Create a new complaint.

**Headers:** Authorization required

**Roles:** Resident, Clerk

**Request Body:**
```json
{
  "roadName": "Main Street",
  "location": {
    "address": "123 Main St, Downtown"
  },
  "description": "Large pothole causing traffic issues",
  "areaType": "commercial"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f5a",
    "complaintId": "CMP000001",
    "roadName": "Main Street",
    "status": "pending",
    ...
  }
}
```

### Update Complaint
**PUT** `/complaints/:id`

Update a complaint.

**Headers:** Authorization required

**Request Body:**
```json
{
  "status": "in-progress",
  "supervisorNotes": "Work started on Nov 10"
}
```

### Delete Complaint
**DELETE** `/complaints/:id`

Delete a complaint.

**Headers:** Authorization required

**Roles:** Administrator, Supervisor

### Assess Complaint
**PUT** `/complaints/:id/assess`

Assess a complaint (assign severity, priority, resources).

**Headers:** Authorization required

**Roles:** Supervisor

**Request Body:**
```json
{
  "severity": "high",
  "areaType": "commercial",
  "resourceEstimate": {
    "materials": [
      {
        "name": "Asphalt",
        "quantity": 500,
        "unit": "kg"
      }
    ],
    "machines": [
      {
        "name": "Roller",
        "quantity": 1
      }
    ],
    "manpower": {
      "workers": 5,
      "engineers": 1
    }
  },
  "supervisorNotes": "High priority - commercial area"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    ...complaint with updated fields and calculated priority
  }
}
```

---

## Resources

### Get All Resources
**GET** `/resources`

Get all resources.

**Headers:** Authorization required

**Query Parameters:**
- `type` - Filter by type (material, machine, manpower)
- `status` - Filter by status (available, in-use, maintenance, unavailable)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5b",
      "type": "material",
      "name": "Cement",
      "category": "Construction",
      "quantity": 1000,
      "totalQuantity": 1500,
      "unit": "kg",
      "status": "available",
      "lastUpdated": "2024-11-09T10:00:00.000Z"
    }
  ]
}
```

### Get Single Resource
**GET** `/resources/:id`

Get details of a specific resource.

### Create Resource
**POST** `/resources`

Add a new resource.

**Headers:** Authorization required

**Roles:** Administrator

**Request Body:**
```json
{
  "type": "machine",
  "name": "Road Roller",
  "category": "Heavy Equipment",
  "quantity": 3,
  "totalQuantity": 5,
  "unit": "units",
  "status": "available",
  "notes": "2 units under maintenance"
}
```

### Update Resource
**PUT** `/resources/:id`

Update a resource.

**Headers:** Authorization required

**Roles:** Administrator

**Request Body:**
```json
{
  "quantity": 2,
  "status": "in-use",
  "notes": "1 unit deployed to Main St project"
}
```

### Delete Resource
**DELETE** `/resources/:id`

Delete a resource.

**Headers:** Authorization required

**Roles:** Administrator

### Get Resource Summary
**GET** `/resources/summary/availability`

Get aggregated resource availability summary.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "material",
      "statuses": [
        {
          "status": "available",
          "count": 5,
          "quantity": 5000
        },
        {
          "status": "in-use",
          "count": 3,
          "quantity": 1500
        }
      ]
    }
  ]
}
```

---

## Schedule

### Get All Schedules
**GET** `/schedule`

Get all schedules.

**Headers:** Authorization required

**Query Parameters:**
- `status` - Filter by status

### Get Single Schedule
**GET** `/schedule/:id`

Get details of a specific schedule.

### Create Schedule
**POST** `/schedule`

Create a new schedule.

**Headers:** Authorization required

**Roles:** Supervisor

**Request Body:**
```json
{
  "complaintId": "60d5ec49f1b2c72b8c8e4f5a",
  "assignedDate": "2024-11-10",
  "estimatedCompletionDate": "2024-11-12",
  "resourcesAllocated": {
    "materials": [
      {
        "resourceId": "60d5ec49f1b2c72b8c8e4f5b",
        "name": "Cement",
        "quantityAllocated": 500,
        "unit": "kg"
      }
    ],
    "machines": [
      {
        "resourceId": "60d5ec49f1b2c72b8c8e4f5c",
        "name": "Roller",
        "quantityAllocated": 1
      }
    ],
    "manpower": {
      "workers": 5,
      "engineers": 1
    }
  }
}
```

### Update Schedule
**PUT** `/schedule/:id`

Update a schedule.

**Headers:** Authorization required

**Roles:** Supervisor, Administrator

### Auto-Schedule
**POST** `/schedule/auto`

Automatically generate schedules for all assessed pending complaints.

**Headers:** Authorization required

**Roles:** Supervisor, Administrator

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    ...array of created schedules
  ]
}
```

### Delete Schedule
**DELETE** `/schedule/:id`

Delete a schedule.

**Headers:** Authorization required

**Roles:** Supervisor, Administrator

---

## Reports

### Get Statistics
**GET** `/reports/statistics`

Get overall system statistics.

**Headers:** Authorization required

**Roles:** Mayor, Administrator, Supervisor

**Query Parameters:**
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 50,
      "completed": 30,
      "pending": 20,
      "averageCompletionDays": 4
    },
    "byStatus": [
      { "_id": "pending", "count": 20 },
      { "_id": "completed", "count": 30 }
    ],
    "bySeverity": [
      { "_id": "high", "count": 15 },
      { "_id": "medium", "count": 20 },
      { "_id": "low", "count": 15 }
    ]
  }
}
```

### Get Area-wise Reports
**GET** `/reports/area-wise`

Get complaints breakdown by area type.

**Headers:** Authorization required

**Roles:** Mayor, Supervisor

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "commercial",
      "total": 15,
      "pending": 5,
      "scheduled": 3,
      "inProgress": 2,
      "completed": 5,
      "highSeverity": 7
    }
  ]
}
```

### Get Resource Utilization
**GET** `/reports/resource-utilization`

Get resource utilization data.

**Headers:** Authorization required

**Roles:** Mayor, Administrator

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "material",
      "total": 10000,
      "available": 6000,
      "inUse": 3000,
      "utilizationPercentage": 30,
      "breakdown": [
        { "status": "available", "count": 5, "quantity": 6000 },
        { "status": "in-use", "count": 3, "quantity": 3000 }
      ]
    }
  ]
}
```

### Get Monthly Trends
**GET** `/reports/trends`

Get monthly complaint trends.

**Headers:** Authorization required

**Roles:** Mayor

**Query Parameters:**
- `months` - Number of months to retrieve (default: 6)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": { "year": 2024, "month": 11 },
      "total": 15,
      "completed": 10,
      "pending": 5
    }
  ]
}
```

---

## Error Responses

All endpoints may return error responses in this format:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "User role 'resident' is not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "resident"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "roadName": "Main Street",
    "location": {"address": "123 Main St"},
    "description": "Large pothole",
    "areaType": "commercial"
  }'
```

### Get All Complaints
```bash
curl -X GET http://localhost:5000/api/complaints \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

Import this URL into Postman for a complete API collection:
(Create a Postman collection and export it, then provide the link)

Or use the cURL examples above to test individual endpoints.
