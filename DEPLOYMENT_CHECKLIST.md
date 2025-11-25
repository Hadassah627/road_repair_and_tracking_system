# 🚀 Quick Deployment Reference

## URLs You'll Need

### After Deployment:
- **Frontend URL**: `https://your-app-name.vercel.app`
- **Backend URL**: `https://your-backend-name.vercel.app`
- **MongoDB Atlas**: `https://cloud.mongodb.com`

---

## Environment Variables

### Backend (.env on Vercel):
```
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/rrts
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
```

### Frontend (.env on Vercel):
```
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## Deployment Checklist

### 1. Database Setup (MongoDB Atlas)
- [ ] Create free cluster
- [ ] Create database user
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Get connection string

### 2. Code Preparation
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] No sensitive data in code
- [ ] .env files in .gitignore

### 3. Backend Deployment
- [ ] Deploy to Vercel/Render
- [ ] Add all environment variables
- [ ] Test API endpoint (visit backend URL)
- [ ] Copy backend URL

### 4. Frontend Deployment
- [ ] Deploy to Vercel
- [ ] Add VITE_API_URL environment variable
- [ ] Test frontend loads
- [ ] Copy frontend URL

### 5. Final Configuration
- [ ] Update backend CORS with frontend URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test complaint creation
- [ ] Test file uploads

---

## Common Issues & Solutions

### ❌ "Cannot connect to database"
**Solution**: Check MongoDB Atlas IP whitelist (use 0.0.0.0/0)

### ❌ "CORS error"
**Solution**: Update CORS origin in backend/server.js with exact frontend URL

### ❌ "401 Unauthorized"
**Solution**: Check JWT_SECRET is set in backend environment variables

### ❌ "Cannot read environment variable"
**Solution**: Redeploy after adding environment variables

### ❌ "File uploads not working"
**Solution**: Deploy backend to Render instead of Vercel (better for file uploads)

### ❌ "404 on page refresh"
**Solution**: Ensure frontend/vercel.json has correct rewrite rules

---

## Testing Your Deployment

### 1. Test Backend
Visit: `https://your-backend.vercel.app`
Should see: `{"success":true,"message":"Road Repair and Tracking System API"}`

### 2. Test Frontend
Visit: `https://your-frontend.vercel.app`
Should see: Landing page of RRTS

### 3. Test Full Flow
1. Register new user ✅
2. Login ✅
3. Create complaint ✅
4. Upload image ✅
5. View dashboard ✅

---

## Important Commands

### Build Frontend Locally (Test Before Deploy)
```bash
cd frontend
npm run build
```

### Check Git Status
```bash
git status
git log --oneline -5
```

### Push Changes
```bash
git add .
git commit -m "Your message"
git push
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Render Docs**: https://render.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

## Contact & Help

If you encounter issues:
1. Check browser console (F12)
2. Check Vercel deployment logs
3. Check MongoDB Atlas metrics
4. Review DEPLOYMENT_GUIDE.md

**Good Luck! 🎉**
