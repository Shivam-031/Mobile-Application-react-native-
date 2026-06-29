# 🌿 Green Yatra India — Complete Platform

> **Eco Marketplace · Carbon Tracking · Plant Biodiversity · Green Pilgrimage Awareness**
> Built with React Native + Node.js + Next.js + MongoDB

---

## 📁 Project Structure

```
GreenYatraIndia/
│
├── backend/          ← Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── app.js              ← Entry point
│   │   ├── config/             ← Database, Cloudinary, Firebase
│   │   ├── middleware/         ← Auth, Error, Validation
│   │   ├── modules/            ← Feature modules
│   │   │   ├── auth/           ← Register, Login, JWT
│   │   │   ├── users/          ← Profile, Avatar, Roles
│   │   │   ├── products/       ← Eco Marketplace products
│   │   │   ├── plants/         ← Plant biodiversity data
│   │   │   ├── carbon/         ← Carbon footprint tracking
│   │   │   ├── orders/         ← Order management
│   │   │   ├── branches/       ← State branch management
│   │   │   ├── inventory/      ← Stock management
│   │   │   ├── locations/      ← India states & zones
│   │   │   └── analytics/      ← Reports & insights
│   │   └── routes/             ← Central route registry
│   ├── .env                    ← Your secrets (create from template)
│   └── package.json
│
├── mobile/           ← React Native App (Android + iOS)
│   ├── App.js                  ← Entry point
│   ├── src/
│   │   ├── screens/            ← All app screens (25 screens)
│   │   ├── navigation/         ← Stack + Tab navigators
│   │   ├── store/              ← Redux Toolkit store + 5 slices
│   │   ├── services/           ← API service, Notifications
│   │   ├── components/         ← Reusable UI components
│   │   ├── hooks/              ← Custom hooks
│   │   └── constants/          ← Theme, API endpoints, Categories
│   ├── .env                    ← Mobile config
│   └── package.json
│
├── admin/            ← Next.js Admin Panel
│   ├── src/
│   │   ├── app/                ← Next.js App Router pages
│   │   │   ├── dashboard/      ← Overview + charts
│   │   │   ├── users/          ← User management + role promotion
│   │   │   ├── products/       ← All products
│   │   │   ├── approvals/      ← Approve/reject branch products
│   │   │   ├── plants/         ← Plant species CRUD
│   │   │   ├── states/         ← India state overview
│   │   │   ├── analytics/      ← Revenue, carbon, user charts
│   │   │   └── carbon-reports/ ← Carbon impact reports
│   │   ├── components/         ← Sidebar, StatsCard, AdminLayout
│   │   └── lib/                ← API client, MUI theme
│   ├── .env.local              ← Admin config
│   └── package.json
│
└── deploy/           ← Deployment configs
    ├── render.yaml             ← Render.com (recommended)
    ├── Dockerfile.backend      ← Docker for backend
    ├── Dockerfile.admin        ← Docker for admin
    ├── nginx.conf              ← Nginx reverse proxy + SSL
    └── deploy.sh               ← Quick deployment script
```

---

## ⚙️ Prerequisites

Make sure these are installed on your machine before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Comes with Node |
| Git | Any | https://git-scm.com |
| MongoDB Atlas account | Free | https://cloud.mongodb.com |
| Cloudinary account | Free | https://cloudinary.com |
| React Native CLI | Latest | `npm install -g react-native-cli` |
| Android Studio | Latest | https://developer.android.com/studio |
| (Optional) Xcode | 14+ | Mac App Store (iOS only) |

---

## 🚀 STEP-BY-STEP SETUP GUIDE

---

### STEP 1 — Clone & Navigate

```bash
# If using git
git clone https://github.com/your-username/green-yatra-india.git
cd green-yatra-india

# Or if you have the folder already
cd GreenYatraIndia
```

---

### STEP 2 — Set Up MongoDB Atlas (Database)

1. Go to **https://cloud.mongodb.com** and sign up (free)
2. Click **"Build a Database"** → Choose **Free (M0)** tier
3. Select region: **Mumbai (ap-south-1)** for best India performance
4. Set a **username** and **password** (save these!)
5. Under **"Network Access"** → Add IP → Click **"Allow Access from Anywhere"** (for dev)
6. Click **"Connect"** → **"Drivers"** → Copy the connection string
7. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
8. Append database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/green_yatra_india`

---

### STEP 3 — Set Up Cloudinary (Image Storage)

1. Go to **https://cloudinary.com** and sign up (free)
2. Go to your **Dashboard**
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. You'll paste these in the backend `.env` file

---

### STEP 4 — Backend Setup

```bash
# Navigate to backend
cd backend

# Install all dependencies
npm install

# Create your environment file from the template
cp .env .env.backup      # backup the template
# Now edit .env with your actual values:
```

Open `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/green_yatra_india
JWT_SECRET=any_long_random_string_min_32_chars_like_this_abc123xyz
JWT_REFRESH_SECRET=another_different_long_random_string_for_refresh
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

> **Firebase is optional for now** — the app works without it. Add it later to enable push notifications.

```bash
# Start the backend server
npm run dev
```

✅ You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🌿 Green Yatra India API running on port 5000 [development]
```

**Test it works:**
```bash
# In a new terminal
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"🌿 Green Yatra India API is running",...}
```

---

### STEP 5 — Admin Panel Setup

```bash
# Open a new terminal, navigate to admin
cd admin

# Install dependencies
npm install

# The .env.local is already configured for local development
# Just verify it points to your backend:
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Start the admin panel
npm run dev
```

✅ Open **http://localhost:3001** in your browser

> **First login:** You need an admin account. Run this in a new terminal to create one:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@greenyatra.in","password":"Admin@123"}'
```
Then manually update the role in MongoDB Atlas:
- Go to Atlas → Browse Collections → `users` collection
- Find your user → Edit → change `role` from `"USER"` to `"ADMIN"` → Save

---

### STEP 6 — Mobile App Setup

#### 6a. Install dependencies

```bash
# Open a new terminal, navigate to mobile
cd mobile

# Install dependencies
npm install

# Install iOS pods (Mac only, skip on Windows/Linux)
cd ios && pod install && cd ..
```

#### 6b. Configure environment

Open `mobile/.env` — the default values work for Android emulator.

For **iOS simulator**, change:
```env
API_URL=http://localhost:5000/api/v1
```

For a **physical device** on the same WiFi, use your computer's local IP:
```env
API_URL=http://192.168.1.XXX:5000/api/v1
```
Find your IP: `ipconfig` (Windows) or `ifconfig | grep inet` (Mac/Linux)

#### 6c. Start Metro bundler

```bash
cd mobile
npx react-native start
```

#### 6d. Run on Android

```bash
# In a new terminal (keep Metro running)
cd mobile
npx react-native run-android
```

> **Android setup:** Make sure Android Studio is installed, an emulator is running (AVD Manager → Play button), or a physical device is connected with USB Debugging enabled.

#### 6e. Run on iOS (Mac only)

```bash
cd mobile
npx react-native run-ios
```

---

### STEP 7 — Verify Everything Works

With all 3 running, test this flow:

1. **Mobile:** Open the app → See splash screen → Register a new account
2. **Backend:** Check terminal — should show the API request logged
3. **Admin:** Login at http://localhost:3001 with your admin account
4. **Mobile:** Browse the marketplace → Add to cart
5. **Admin:** Go to Approvals → Approve a product
6. **Mobile:** Carbon Calculator → Enter travel data → See your CO₂ result

---

## 🖥️ Running All Three Together

Open **3 separate terminals:**

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Admin Panel
cd admin && npm run dev

# Terminal 3 — Mobile (after Metro starts)
cd mobile && npx react-native start
# Then in Terminal 4:
cd mobile && npx react-native run-android
```

| Service | URL / Port | Description |
|---------|-----------|-------------|
| Backend API | http://localhost:5000 | REST API |
| API Health | http://localhost:5000/health | Check if API is up |
| Admin Panel | http://localhost:3001 | Web admin dashboard |
| Mobile | Android/iOS emulator | React Native app |

---

## 📱 User Roles & Test Accounts

Create these test accounts via the mobile app or API:

| Role | What They Can Do |
|------|-----------------|
| `USER` | Browse products, buy, calculate carbon, view plants |
| `EMPLOYEE` | All of USER + manage products/inventory for their state |
| `MASTER_ADMIN` | Everything + approve products, manage all users, admin panel |

**To promote a user to EMPLOYEE or MASTER_ADMIN:**
1. Login to Admin Panel → Users → Find the user → Click "Promote"
2. Or directly in MongoDB Atlas: change the `role` field

---

## 🌐 API Reference

All API endpoints are prefixed with `/api/v1`

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login
POST   /auth/logout            Logout
POST   /auth/refresh-token     Get new access token
POST   /auth/forgot-password   Send reset email
POST   /auth/reset-password/:token  Reset password
GET    /auth/me                Get current user
```

### Products
```
GET    /products               List products (filter: category, state, search, sort)
GET    /products/:id           Get product detail
POST   /products               Create product (Branch Head / Admin)
PUT    /products/:id           Update product
PATCH  /products/:id/approve   Approve / reject product (Admin only)
DELETE /products/:id           Soft delete product
GET    /products/branch/mine   Branch head's own products
```

### Plants
```
GET    /plants                 List plant species
GET    /plants/:id             Plant detail
GET    /plants/stats/summary   Dashboard stats (total, native, protected)
POST   /plants                 Add plant (Branch Head / Admin)
PUT    /plants/:id             Update plant
```

### Carbon
```
POST   /carbon/calculate       Calculate & save carbon footprint
GET    /carbon/history         User's monthly carbon history
```

### Orders
```
POST   /orders                 Place order
GET    /orders/my              User's orders
GET    /orders/:id             Order detail
PATCH  /orders/:id/status      Update order status (Branch Head / Admin)
GET    /orders/branch/all      All orders for branch (Branch Head / Admin)
```

### Others
```
GET    /branches               All state branches
GET    /branches/state/:name   Branch for specific state
GET    /branches/mine          Branch head's own branch
POST   /branches               Create branch (Admin)

GET    /locations/states       All India states with coordinates
GET    /locations/states/:name/stats   State-specific stats

GET    /analytics/dashboard    Admin dashboard data
GET    /analytics/branch       Branch analytics

GET    /inventory/summary      Branch inventory overview
PATCH  /inventory/:id/stock    Update stock
```

---

## 🏗️ Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| cloudinary | Image storage |
| multer | File upload handling |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| helmet | Security headers |
| morgan | HTTP request logging |
| firebase-admin | Push notifications |
| dotenv | Environment variables |

### Mobile
| Package | Purpose |
|---------|---------|
| react-native | Mobile framework |
| @react-navigation/native | Navigation |
| @react-navigation/bottom-tabs | Tab navigator |
| @react-navigation/stack | Stack navigator |
| @reduxjs/toolkit | State management |
| react-redux | Redux bindings |
| axios | HTTP client |
| @tanstack/react-query | Server state + caching |
| react-native-maps | India Green Map |
| react-native-svg | CarbonScoreRing |
| lottie-react-native | Animations |
| @react-native-async-storage/async-storage | Token storage |
| react-native-vector-icons | Icons |
| react-native-reanimated | Animations |

### Admin Panel
| Package | Purpose |
|---------|---------|
| next | React framework |
| @mui/material | UI components |
| @mui/icons-material | Icons |
| recharts | Charts (bar, line, area, radar, pie) |
| axios | HTTP client |
| js-cookie | Cookie management |

---

## ☁️ Production Deployment

### Option A — Render.com (Recommended, Easy)

1. Push your code to GitHub
2. Go to **https://render.com** → New → Blueprint
3. Connect your GitHub repo
4. Render reads `deploy/render.yaml` automatically
5. Set environment variables in the Render dashboard:
   - Backend: all variables from `backend/.env`
   - Admin: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1`
6. Click **Deploy**

### Option B — Docker

```bash
# Backend
docker build -f deploy/Dockerfile.backend -t green-yatra-backend .
docker run -p 5000:5000 --env-file backend/.env green-yatra-backend

# Admin Panel
docker build -f deploy/Dockerfile.admin -t green-yatra-admin .
docker run -p 3001:3001 green-yatra-admin
```

### Option C — VPS (Ubuntu/Nginx)

```bash
# 1. Run the deploy script
bash deploy/deploy.sh

# 2. Copy nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/greenyatra
sudo ln -s /etc/nginx/sites-available/greenyatra /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Get SSL certificate
sudo certbot --nginx -d api.greenyatra.in -d admin.greenyatra.in

# 4. Start with PM2
npm install -g pm2
cd backend && pm2 start src/app.js --name green-yatra-backend
cd admin && pm2 start npm --name green-yatra-admin -- start
pm2 save && pm2 startup
```

### Mobile App — Build for Release

```bash
cd mobile

# Android APK
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk

# Android AAB (for Play Store)
./gradlew bundleRelease
# AAB: android/app/build/outputs/bundle/release/app-release.aab

# iOS (Mac only)
# Open ios/GreenYatraIndia.xcworkspace in Xcode
# Product → Archive → Distribute App
```

---

## 🔧 Common Issues & Fixes

### Backend won't connect to MongoDB
```
❌ MongoDB connection error: Authentication failed
```
**Fix:** Check your MONGO_URI — make sure username and password have no special characters, or URL-encode them. Example: `@` → `%40`

---

### Mobile app can't reach the backend
```
❌ Network request failed
```
**Fix options:**
- Android emulator: use `10.0.2.2` instead of `localhost`
- Physical device: use your computer's local IP (check `mobile/.env`)
- Make sure backend is running on port 5000

---

### Admin panel shows blank / 401
```
❌ Redirected to /login
```
**Fix:** Your account needs `ADMIN` role. Update it in MongoDB Atlas → users collection → your document → change `role` to `"ADMIN"`.

---

### React Native Metro bundler error
```
❌ Unable to resolve module ...
```
**Fix:**
```bash
cd mobile
npm install
npx react-native start --reset-cache
```

---

### Android build fails — SDK not found
**Fix:** Open Android Studio → SDK Manager → Install Android 13 (API 33) or latest. Set `ANDROID_HOME` environment variable.

---

## 📞 Services to Sign Up For

| Service | URL | Free Tier | Used For |
|---------|-----|-----------|---------|
| MongoDB Atlas | https://cloud.mongodb.com | 512MB storage | Database |
| Cloudinary | https://cloudinary.com | 25GB storage | Product images |
| Firebase | https://console.firebase.google.com | Spark plan | Push notifications |
| Render.com | https://render.com | 750hrs/month | Backend + Admin hosting |

---

## 📂 Key Files Quick Reference

| File | What to change |
|------|---------------|
| `backend/.env` | All backend secrets and API keys |
| `admin/.env.local` | Backend API URL for admin |
| `mobile/.env` | Backend API URL for mobile |
| `mobile/src/constants/api.js` | API endpoint paths |
| `mobile/src/constants/theme.js` | Colors, fonts, spacing |
| `backend/src/config/database.js` | MongoDB connection options |
| `deploy/render.yaml` | Deployment config for Render |

---

## 🌿 Built With Love for a Greener India

```
Green Yatra India v1.0.0
Backend:    Node.js + Express + MongoDB
Mobile:     React Native (Android + iOS)
Admin:      Next.js + Material UI
Deployment: Render / Docker / Nginx
```

> For bugs, features, or questions — raise a GitHub issue or contact the team.
