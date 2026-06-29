#!/bin/bash
# Green Yatra India — Deployment Script

echo "🌿 Green Yatra India — Deployment"
echo "=================================="

# Check environment
if [ -z "$MONGO_URI" ]; then echo "❌ MONGO_URI not set"; exit 1; fi
if [ -z "$JWT_SECRET" ]; then echo "❌ JWT_SECRET not set"; exit 1; fi

echo "✅ Environment check passed"

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install --production
echo "✅ Backend ready"

# Admin Panel
echo ""
echo "🖥️  Building admin panel..."
cd ../admin && npm install && npm run build
echo "✅ Admin panel built"

echo ""
echo "🚀 Deployment ready!"
echo ""
echo "Next steps:"
echo "  1. Push to GitHub"
echo "  2. Connect Render.com to your repo"
echo "  3. Set environment variables on Render"
echo "  4. Deploy!"
echo ""
echo "MongoDB Atlas: https://cloud.mongodb.com"
echo "Cloudinary:    https://cloudinary.com"
echo "Render:        https://render.com"
echo "Firebase:      https://console.firebase.google.com"
