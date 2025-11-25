# Road Repair and Tracking System (RRTS)

A comprehensive full-stack MERN application for automating and tracking road repair processes for a city's Public Works Department.

## Features

- **Multi-Role System**: Resident, Clerk, Supervisor, Administrator, and Mayor roles
- **Complaint Management**: Submit, track, and manage road repair requests
- **Smart Scheduling**: Automatic prioritization based on severity and area type
- **Resource Management**: Real-time tracking of manpower, machines, and materials
- **Analytics Dashboard**: City-wide statistics and reports
- **Authentication**: JWT-based secure authentication and role-based access control

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
rrts/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── App.js
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rrts
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start MongoDB and run the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## User Roles

### Resident
- Submit road repair requests
- Track complaint status
- View repair history

### Clerk
- Enter complaints from phone/written forms
- View and manage complaint entries

### Supervisor
- Review area-wise complaints
- Assign severity levels (Low, Medium, High)
- Set priorities based on area type
- Estimate resources (materials, machines, manpower)
- Schedule repairs

### Administrator
- Manage resource inventory
- Update resource availability status
- Trigger rescheduling when resources change

### Mayor
- View city-wide statistics
- Monitor completed vs pending repairs
- Analyze resource utilization
- Review area-wise performance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Complaints
- `GET /api/complaints` - Get all complaints (filtered by role)
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Scheduling
- `GET /api/schedule` - Get all schedules
- `POST /api/schedule` - Create/update schedule
- `POST /api/schedule/auto` - Auto-generate schedule

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Add new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Reports
- `GET /api/reports/statistics` - Get overall statistics
- `GET /api/reports/area-wise` - Get area-wise reports
- `GET /api/reports/resource-utilization` - Get resource utilization data

## Default Test Accounts

After running the application, you can create users with the following roles:

- **Resident**: resident@test.com / password123
- **Clerk**: clerk@test.com / password123
- **Supervisor**: supervisor@test.com / password123
- **Administrator**: admin@test.com / password123
- **Mayor**: mayor@test.com / password123

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on port 3000 with hot reload
```

## License

MIT License
