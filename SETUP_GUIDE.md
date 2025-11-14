# Road Repair and Tracking System (RRTS)
# Complete Setup and Deployment Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or higher): https://nodejs.org/
- **MongoDB** (v4.4 or higher): https://www.mongodb.com/try/download/community
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - PORT=5000
# - MONGODB_URI=mongodb://localhost:27017/rrts
# - JWT_SECRET=your_secret_key_here
# - JWT_EXPIRE=7d
# - NODE_ENV=development

# Start MongoDB (if not running as service)
# On Linux/Mac:
sudo systemctl start mongod
# OR
mongod --dbpath /path/to/data/directory

# On Windows:
net start MongoDB

# Start the backend server
npm run dev
```

The backend server will run on **http://localhost:5000**

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will run on **http://localhost:3000**

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rrts

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### MongoDB Connection Strings

**Local MongoDB:**
```
mongodb://localhost:27017/rrts
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/rrts?retryWrites=true&w=majority
```

## 👥 Creating Initial User Accounts

After starting the application, create accounts for different roles:

1. Go to **http://localhost:3000/register**
2. Create accounts with different roles:
   - **Resident**: For submitting complaints
   - **Clerk**: For entering phone/written complaints
   - **Supervisor**: For assessing and scheduling (requires area field)
   - **Administrator**: For managing resources
   - **Mayor**: For viewing analytics

### Sample Test Accounts

You can create these test accounts:

```
Resident:
- Email: resident@test.com
- Password: password123
- Role: Resident

Clerk:
- Email: clerk@test.com
- Password: password123
- Role: Clerk

Supervisor:
- Email: supervisor@test.com
- Password: password123
- Role: Supervisor
- Area: Downtown

Administrator:
- Email: admin@test.com
- Password: password123
- Role: Administrator

Mayor:
- Email: mayor@test.com
- Password: password123
- Role: Mayor
```

## 📱 Application Workflow

### 1. Resident/Clerk Flow
- Login to the system
- Submit new road repair complaint
- Track complaint status

### 2. Supervisor Flow
- Login and view pending complaints
- Assess each complaint:
  - Assign severity (Low/Medium/High)
  - Set area type (Commercial/Busy/Residential/Deserted)
  - Estimate resources needed
  - Add supervisor notes
- Use "Auto Schedule" to generate repair schedules

### 3. Administrator Flow
- Login and view resource inventory
- Add new resources (Materials, Machines, Manpower)
- Update resource status (Available/In-Use/Maintenance/Unavailable)
- Monitor resource utilization

### 4. Mayor Flow
- Login to view city-wide analytics
- Review statistics dashboard
- Analyze area-wise performance
- Monitor resource utilization
- Track monthly trends

## 🏗️ Production Deployment

### Backend Deployment

1. **Set Production Environment Variables:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_strong_secret_key
```

2. **Build and Run:**

```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment

1. **Build for Production:**

```bash
cd frontend
npm run build
```

2. **The build output will be in `frontend/dist` directory**

3. **Deploy Options:**
   - **Vercel**: `vercel deploy`
   - **Netlify**: Connect to Git repository or drag & drop `dist` folder
   - **AWS S3**: Upload `dist` folder to S3 bucket
   - **Docker**: Use the provided Dockerfile

### Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/rrts
      - JWT_SECRET=your_secret_key
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Run with: `docker-compose up`

## 🔒 Security Recommendations

1. **Change Default JWT Secret**: Use a strong, random string
2. **Enable HTTPS**: Use SSL certificates in production
3. **Set CORS Properly**: Configure allowed origins
4. **Rate Limiting**: Add rate limiting middleware
5. **Input Validation**: Already implemented with express-validator
6. **MongoDB Security**: Use authentication and access control

## 🧪 Testing the Application

### Test Workflow:

1. **Register as Resident**
   - Submit 3-5 road repair complaints
   - Note the complaint IDs

2. **Login as Supervisor**
   - Assess each complaint
   - Assign severity and estimate resources
   - Click "Auto Schedule" button

3. **Login as Administrator**
   - Add various resources:
     - Materials: Cement, Asphalt, Gravel
     - Machines: Roller, Mixer, Excavator
     - Manpower: Workers, Engineers
   - Update resource statuses

4. **Login as Mayor**
   - View statistics dashboard
   - Check area-wise reports
   - Analyze resource utilization charts

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Issues

Add to backend `server.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📊 Database Collections

The application uses 4 main MongoDB collections:

1. **users**: User accounts and authentication
2. **complaints**: Road repair complaints
3. **resources**: Materials, machines, and manpower
4. **schedules**: Repair schedules and assignments

## 🔄 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `PUT /api/complaints/:id/assess` - Assess complaint (Supervisor)

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Add resource (Admin)
- `PUT /api/resources/:id` - Update resource (Admin)

### Schedule
- `GET /api/schedule` - Get schedules
- `POST /api/schedule/auto` - Auto-generate schedule

### Reports
- `GET /api/reports/statistics` - Overall statistics
- `GET /api/reports/area-wise` - Area-wise reports
- `GET /api/reports/resource-utilization` - Resource utilization
- `GET /api/reports/trends` - Monthly trends

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check browser console for frontend errors
- Check server logs for backend errors

## 📄 License

MIT License - Feel free to use and modify for your needs.
