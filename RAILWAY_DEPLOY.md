# Railway Deployment Guide for Smart Waste Management System

## 🚂 Railway Deployment Troubleshooting & Setup

### Current Issue Resolution

**Problem**: `npm ERR! Cannot read property 'express' of undefined`

**Root Cause**: Corrupted `package-lock.json` file causing npm installation failure.

**Solution Applied**:
1. ✅ Deleted corrupted `package-lock.json`
2. ✅ Regenerated with `npm install`
3. ✅ Updated Node.js version to 18.x
4. ✅ Added Railway-specific configuration files

---

## 🔧 Pre-Deployment Checklist

### 1. Clean Dependencies
```bash
# Run these commands locally before pushing to Railway
rm -f package-lock.json
npm install
git add .
git commit -m "Fix package-lock.json for Railway deployment"
git push origin main
```

### 2. Environment Variables in Railway
Set these in your Railway project dashboard:

**Required:**
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_waste_management
```

**Optional:**
```
ALLOWED_ORIGINS=https://your-frontend.netlify.app
JWT_SECRET=your-super-secret-key
DEFAULT_LATITUDE=40.7128
DEFAULT_LONGITUDE=-74.0060
```

### 3. Railway Project Settings
```
Build Command: npm install
Start Command: npm start
Root Directory: / (leave empty)
```

---

## 📁 Configuration Files Added

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci --omit=dev --ignore-scripts"]

[start]
cmd = "npm start"

[variables]
NODE_ENV = "production"
PORT = "8000"
```

---

## 🛠 Step-by-Step Railway Deployment

### Step 1: Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `smart-waste-management` repository
4. Choose the main branch

### Step 2: Configure Environment
1. Go to project → Variables tab
2. Add the environment variables listed above
3. Especially important: `MONGO_URI` with your MongoDB connection string

### Step 3: Deploy Settings
Railway should auto-detect your Node.js app, but verify:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18.x (from package.json)

### Step 4: Monitor Deployment
1. Check the deployment logs in Railway dashboard
2. Look for successful database connection
3. Verify the API is running on the assigned port

---

## 🔍 Common Railway Issues & Solutions

### Issue 1: Build Fails with npm errors
**Solution**: 
```bash
# Locally run:
npm run clean  # This deletes node_modules and package-lock.json
npm install
git add . && git commit -m "Clean npm dependencies" && git push
```

### Issue 2: "Cannot find module" errors
**Solution**: Check that all dependencies are in `package.json`, not just `devDependencies`

### Issue 3: Database connection fails
**Solutions**:
- Verify `MONGO_URI` environment variable is set
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check MongoDB Atlas user has read/write permissions

### Issue 4: Port binding errors
**Solution**: Railway automatically sets `PORT` environment variable. Your app should use:
```javascript
const PORT = process.env.PORT || 5000;
```

### Issue 5: CORS errors when connecting frontend
**Solution**: Update your backend CORS configuration:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.netlify.app',
    process.env.ALLOWED_ORIGINS
  ],
  credentials: true
}));
```

---

## 📊 Monitoring & Debugging

### Check Deployment Status
1. **Railway Dashboard** → Your Project → Deployments
2. **Logs Tab** → Real-time deployment and runtime logs
3. **Metrics Tab** → CPU, Memory, Network usage

### Debug Commands
```bash
# View recent logs
railway logs

# Connect to your service
railway shell

# Check environment variables
railway variables
```

### Health Check Endpoint
Add this to your `backend/server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});
```

---

## 🚀 Post-Deployment Steps

### 1. Test Your API
Your Railway backend URL will be: `https://your-project-name.up.railway.app`

Test endpoints:
```bash
curl https://your-project-name.up.railway.app/health
curl https://your-project-name.up.railway.app/api/bins
```

### 2. Update Frontend Configuration
In your Netlify environment variables, set:
```
API_BASE_URL=https://your-project-name.up.railway.app/api
```

### 3. Database Seeding
If you need to seed your database:
```bash
# Add this script to package.json
"railway:seed": "node seed.js"
```

Then run via Railway CLI:
```bash
railway run npm run railway:seed
```

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong, unique values for secrets
- ✅ Rotate API keys regularly
- ✅ Use MongoDB Atlas for production database

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.netlify.app'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

---

## 📞 Support & Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Node.js Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Environment Variables](https://docs.railway.app/develop/variables)

### MongoDB Atlas Setup
- [Create Free Cluster](https://www.mongodb.com/cloud/atlas)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)

### Troubleshooting Checklist
- [ ] Package-lock.json is not corrupted
- [ ] All dependencies in package.json
- [ ] Environment variables set in Railway
- [ ] MongoDB connection string is correct
- [ ] CORS configured for your frontend domain
- [ ] Health check endpoint responds
- [ ] Frontend API_BASE_URL updated

---

## 🎯 Expected Result

After following this guide:
- ✅ Backend API running on Railway
- ✅ Database connected and seeded
- ✅ CORS configured for frontend
- ✅ Health monitoring enabled
- ✅ Frontend connects successfully

**Your API will be available at**: `https://your-project-name.up.railway.app/api`

Test with: `https://your-project-name.up.railway.app/api/bins`
