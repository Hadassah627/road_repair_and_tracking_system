#!/bin/bash

# RRTS Deployment Preparation Script
# This script prepares your application for deployment

echo "🚀 RRTS Deployment Preparation"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "⚠️  Warning: .gitignore not found"
else
    echo "✅ .gitignore exists"
fi

# Check for .env files (should not be committed)
echo ""
echo "🔍 Checking for sensitive files..."
if [ -f backend/.env ]; then
    echo "⚠️  backend/.env found (this should NOT be committed)"
    echo "   Make sure it's in .gitignore"
fi

if [ -f frontend/.env ]; then
    echo "⚠️  frontend/.env found (this should NOT be committed)"
    echo "   Make sure it's in .gitignore"
fi

# Check if example env files exist
echo ""
echo "📋 Checking for example environment files..."
if [ -f backend/.env.example ]; then
    echo "✅ backend/.env.example exists"
else
    echo "❌ backend/.env.example missing"
fi

if [ -f frontend/.env.example ]; then
    echo "✅ frontend/.env.example exists"
else
    echo "❌ frontend/.env.example missing"
fi

# Check for vercel.json files
echo ""
echo "⚙️  Checking for deployment config files..."
if [ -f backend/vercel.json ]; then
    echo "✅ backend/vercel.json exists"
else
    echo "❌ backend/vercel.json missing"
fi

if [ -f frontend/vercel.json ]; then
    echo "✅ frontend/vercel.json exists"
else
    echo "❌ frontend/vercel.json missing"
fi

# Check node_modules
echo ""
echo "📦 Checking dependencies..."
if [ -d backend/node_modules ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies not installed"
    echo "   Run: cd backend && npm install"
fi

if [ -d frontend/node_modules ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
fi

# Test if frontend builds successfully
echo ""
echo "🏗️  Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend builds successfully"
    rm -rf dist
else
    echo "❌ Frontend build failed - fix errors before deploying"
fi
cd ..

echo ""
echo "================================"
echo "📝 Next Steps:"
echo ""
echo "1. Setup MongoDB Atlas (if not done)"
echo "   - Visit: https://www.mongodb.com/cloud/atlas"
echo "   - Get connection string"
echo ""
echo "2. Create GitHub Repository"
echo "   - Visit: https://github.com/new"
echo "   - Push your code:"
echo "     git add ."
echo "     git commit -m 'Prepare for deployment'"
echo "     git remote add origin YOUR_GITHUB_REPO_URL"
echo "     git push -u origin main"
echo ""
echo "3. Deploy to Vercel"
echo "   - Visit: https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Deploy backend (root: backend)"
echo "   - Deploy frontend (root: frontend)"
echo ""
echo "4. Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🎉 Good luck with your deployment!"
