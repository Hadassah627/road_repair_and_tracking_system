# 🚀 RRTS Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier)
- MongoDB Atlas account (free tier)

---

## Step 1: Setup MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `rrts` (or your preferred name)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rrts?retryWrites=true&w=majority`

---

## Step 2: Push Code to GitHub

1. **Initialize Git (if not already done)**
   ```bash
   cd /home/rguktvalley/Documents/rrts_final
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com
   - Click "New Repository"
   - Name it "rrts-deployment" (or any name)
   - Click "Create Repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rrts-deployment.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Backend Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Set Root Directory: `backend`
   - Framework Preset: "Other"

3. **Configure Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = any_random_long_string_here_min_32_chars
   NODE_ENV = production
   FRONTEND_URL = (leave empty for now, will update later)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

---

## Step 4: Deploy Frontend to Vercel

1. **Import Frontend Project**
   - Click "Add New..." → "Project"
   - Import the same GitHub repository
   - Set Root Directory: `frontend`
   - Framework Preset: "Vite"

2. **Configure Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL = https://your-backend.vercel.app/api
   ```
   (Replace with your actual backend URL from Step 3)

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://your-frontend.vercel.app`)

---

## Step 5: Update Backend CORS Settings

1. **Go to Backend Vercel Project**
   - Click on your backend project in Vercel
   - Go to "Settings" → "Environment Variables"

2. **Add/Update FRONTEND_URL**
   ```
   FRONTEND_URL = https://your-frontend.vercel.app
   ```

3. **Update server.js CORS in your local code**
   - Update the CORS origin in `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend.vercel.app'],
     credentials: true
   }));
   ```

4. **Commit and Push Changes**
   ```bash
   git add backend/server.js
   git commit -m "Update CORS for production"
   git push
   ```
   - Vercel will automatically redeploy

---

## Step 6: Test Your Deployment

1. **Visit your frontend URL**
   - Example: `https://your-frontend.vercel.app`

2. **Test the following:**
   - ✅ Registration works
   - ✅ Login works
   - ✅ Dashboard loads
   - ✅ Can create complaints
   - ✅ Can view data

---

## Alternative: Deploy Backend to Render (Recommended for Better File Upload Support)

Vercel has limitations with file uploads. For better performance with file uploads:

### Deploy Backend to Render:

1. **Go to Render**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `rrts-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: `Free`

3. **Add Environment Variables**
   ```
   MONGODB_URI = your_mongodb_atlas_connection_string
   JWT_SECRET = any_random_long_string_here
   NODE_ENV = production
   FRONTEND_URL = your_vercel_frontend_url
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the URL (e.g., `https://rrts-backend.onrender.com`)

5. **Update Frontend Environment Variable on Vercel**
   - Go to frontend project on Vercel
   - Settings → Environment Variables
   - Update `VITE_API_URL` to `https://rrts-backend.onrender.com/api`
   - Redeploy frontend

---

## Troubleshooting

### Backend Issues:
- **Database connection error**: Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- **401 Unauthorized**: Check JWT_SECRET is set correctly
- **CORS error**: Verify CORS origin matches frontend URL exactly

### Frontend Issues:
- **Can't connect to API**: Check VITE_API_URL is set correctly
- **404 on refresh**: vercel.json should handle SPA routing (already configured)
- **Blank page**: Check browser console for errors

### File Upload Issues:
- **Uploads not working on Vercel**: Deploy backend to Render instead
- **Missing files after deploy**: Use cloud storage (Cloudinary, AWS S3)

---

## 📝 Quick Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed (Vercel or Render)
- [ ] Frontend deployed (Vercel)
- [ ] Environment variables configured on both
- [ ] CORS updated with correct frontend URL
- [ ] Application tested and working

---

## 🎉 Congratulations!

Your RRTS application is now live!

**Frontend URL**: https://your-frontend.vercel.app
**Backend URL**: https://your-backend.vercel.app

Share these URLs to access your application from anywhere!
