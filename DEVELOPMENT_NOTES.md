# Development Notes

## Project Structure

### Backend
- **models/**: Mongoose schemas for MongoDB collections
- **controllers/**: Business logic for each route
- **routes/**: API endpoint definitions
- **middlewares/**: Authentication and error handling
- **config/**: Database connection configuration

### Frontend
- **components/**: Reusable React components
- **pages/**: Dashboard pages for each user role
- **context/**: React Context for state management
- **services/**: API integration with axios

## Key Features Implemented

### 1. Authentication System
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Password hashing with bcrypt

### 2. Complaint Management
- CRUD operations
- Status tracking (Pending → Scheduled → In Progress → Completed)
- Auto-generated complaint IDs
- Filter by role (Residents see only their complaints)

### 3. Resource Management
- Track materials, machines, and manpower
- Status management (Available, In-Use, Maintenance, Unavailable)
- Real-time quantity tracking
- Administrator-only access

### 4. Scheduling System
- Manual scheduling by supervisors
- Auto-schedule based on priority
- Priority calculation: severity + area type
- Resource allocation tracking

### 5. Reporting & Analytics
- Overall statistics
- Area-wise performance
- Resource utilization charts
- Monthly trend analysis
- Interactive charts with Recharts

## Database Schema Design

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['resident', 'clerk', 'supervisor', 'administrator', 'mayor'],
  area: String (required for supervisors),
  phone: String
}
```

### Complaints Collection
```javascript
{
  complaintId: String (auto-generated),
  roadName: String,
  location: { address, coordinates },
  description: String,
  severity: Enum ['low', 'medium', 'high'],
  areaType: Enum ['commercial', 'busy', 'deserted', 'residential'],
  priority: Number (1-10),
  status: Enum ['pending', 'scheduled', 'in-progress', 'completed', 'rejected'],
  submittedBy: ObjectId (User),
  supervisorId: ObjectId (User),
  resourceEstimate: Object,
  dateRaised: Date,
  dateScheduled: Date,
  dateCompleted: Date
}
```

### Resources Collection
```javascript
{
  type: Enum ['material', 'machine', 'manpower'],
  name: String,
  category: String,
  quantity: Number,
  totalQuantity: Number,
  unit: String,
  status: Enum ['available', 'in-use', 'maintenance', 'unavailable'],
  updatedBy: ObjectId (User)
}
```

### Schedule Collection
```javascript
{
  complaintId: ObjectId (Complaint),
  assignedDate: Date,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  resourcesAllocated: Object,
  status: Enum ['scheduled', 'in-progress', 'completed', 'rescheduled', 'cancelled'],
  supervisorId: ObjectId (User),
  progressUpdates: Array
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Priority Calculation Logic

```javascript
Priority = f(Severity, AreaType)

High Severity:
  - Commercial Area: Priority 10
  - Busy Area: Priority 9
  - Residential Area: Priority 7
  - Deserted Area: Priority 7

Medium Severity:
  - Commercial Area: Priority 7
  - Busy Area: Priority 6
  - Residential Area: Priority 5
  - Deserted Area: Priority 5

Low Severity:
  - Commercial Area: Priority 4
  - Busy Area: Priority 3
  - Residential Area: Priority 2
  - Deserted Area: Priority 2
```

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Mobile App**: React Native version
3. **Photo Upload**: Image storage for complaint photos
4. **Map Integration**: Google Maps for location selection
5. **SMS Notifications**: Twilio integration
6. **PDF Reports**: Generate downloadable reports
7. **Advanced Analytics**: Predictive maintenance using ML
8. **Approval Workflow**: Multi-level approval system
9. **Budget Tracking**: Cost estimation and tracking
10. **Audit Logs**: Track all system changes

## Technology Choices Explained

### Backend
- **Express.js**: Lightweight, flexible, large ecosystem
- **MongoDB**: Schema flexibility, good for rapid development
- **JWT**: Stateless authentication, scalable
- **Mongoose**: Schema validation, middleware support

### Frontend
- **React**: Component-based, large community, reusable code
- **Vite**: Fast build tool, better DX than CRA
- **Tailwind CSS**: Utility-first, rapid styling, small bundle
- **Recharts**: Simple, customizable charts
- **Axios**: Promise-based, interceptors for auth

## Performance Considerations

1. **Database Indexing**: Index on frequently queried fields
   ```javascript
   complaintId (unique index)
   status (for filtering)
   submittedBy (for user queries)
   ```

2. **Pagination**: Implement for large datasets
3. **Caching**: Redis for frequently accessed data
4. **Image Optimization**: Compress and resize uploaded images
5. **Code Splitting**: Lazy load routes and components

## Security Measures Implemented

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure, short expiration
3. **Input Validation**: express-validator
4. **CORS**: Restricted origins
5. **MongoDB Injection**: Mongoose sanitization
6. **XSS Protection**: React auto-escaping
7. **HTTPS**: Required in production

## Deployment Checklist

- [ ] Change JWT secret
- [ ] Enable MongoDB authentication
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Set up error tracking (Sentry)
- [ ] Optimize bundle size
- [ ] Enable CDN for static assets
- [ ] Configure CI/CD pipeline
