# MongoDB Atlas Setup Guide for Smart Waste Management System

## 🍃 Complete MongoDB Atlas Configuration

This guide will help you set up MongoDB Atlas (cloud database) for your Smart Waste Management System deployed on Railway.

---

## 📋 Prerequisites

- Email account (Gmail recommended)
- Your Railway project URL
- 10-15 minutes of time

---

## 🚀 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. **Navigate to MongoDB Atlas**
   - Go to: https://www.mongodb.com/atlas
   - Click **"Try Free"** button

2. **Sign Up Options**
   - **Recommended**: Sign up with Google account
   - **Alternative**: Create account with email and password

3. **Complete Registration**
   - Verify email if using email signup
   - Answer optional survey questions (can skip)

### Step 2: Create Your First Cluster

1. **Choose Deployment Type**
   - Select **"M0 Sandbox"** (Free forever)
   - Shows: `FREE`, `512 MB Storage`, `Shared RAM`

2. **Select Cloud Provider & Region**
   - **Cloud Provider**: `AWS` (recommended)
   - **Region**: Choose closest to your users:
     - `N. Virginia (us-east-1)` - US East Coast
     - `Oregon (us-west-2)` - US West Coast  
     - `Ireland (eu-west-1)` - Europe
     - `Singapore (ap-southeast-1)` - Asia

3. **Name Your Cluster**
   - **Cluster Name**: `smart-waste-cluster`
   - Leave other settings as default

4. **Create Cluster**
   - Click **"Create Deployment"**
   - Wait 3-5 minutes for cluster creation

### Step 3: Configure Database Security

#### A. Create Database User

1. **Navigate to Security Settings**
   - Click **"Database Access"** in left sidebar
   - Click **"Add New Database User"**

2. **User Configuration**
   - **Authentication Method**: `Password`
   - **Username**: `wasteapp`
   - **Password**: Click **"Autogenerate Secure Password"**
   - **IMPORTANT**: Copy and save this password securely!

3. **Set User Privileges**
   - **Database User Privileges**: Select `Read and write to any database`
   - **Specific Privileges**: Leave empty

4. **Create User**
   - Click **"Add User"**

#### B. Configure Network Access

1. **Navigate to Network Access**
   - Click **"Network Access"** in left sidebar
   - Click **"Add IP Address"**

2. **Allow Railway Access**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (required for Railway hosting)
   - **Description**: `Railway hosting access`

3. **Confirm Settings**
   - Click **"Confirm"**

### Step 4: Get Connection String

1. **Connect to Cluster**
   - Go to **"Database"** → **"Clusters"**
   - Click **"Connect"** button on your cluster

2. **Choose Connection Method**
   - Select **"Connect your application"**

3. **Driver Configuration**
   - **Driver**: `Node.js`
   - **Version**: `4.1 or later`

4. **Copy Connection String**
   ```
   mongodb+srv://<username>:<password>@smart-waste-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace Placeholders**
   - Replace `<username>` with: `wasteapp`
   - Replace `<password>` with your saved password
   - Add database name: `/smart_waste_management`

   **Final format**:
   ```
   mongodb+srv://wasteapp:YOUR_PASSWORD@smart-waste-cluster.xxxxx.mongodb.net/smart_waste_management?retryWrites=true&w=majority
   ```

### Step 5: Configure Railway Environment

1. **Open Railway Dashboard**
   - Go to: https://railway.app
   - Navigate to your `smart-waste-management` project

2. **Add Environment Variable**
   - Click **"Variables"** tab
   - Click **"New Variable"**

3. **Set MongoDB URI**
   - **Variable Name**: `MONGO_URI`
   - **Variable Value**: Your complete connection string
   ```
   mongodb+srv://wasteapp:YOUR_PASSWORD@smart-waste-cluster.xxxxx.mongodb.net/smart_waste_management?retryWrites=true&w=majority
   ```

4. **Deploy Changes**
   - Click **"Add"**
   - Railway will automatically redeploy with new environment variable

---

## 🔧 Database Structure Setup

Your application will automatically create the database structure. The main collections will be:

### Collections Created Automatically:
- `bins` - Waste bin locations and status
- `users` - User accounts (if implemented)
- `collections` - Waste collection records

### Sample Bin Document:
```json
{
  "_id": "ObjectId",
  "name": "Main Street Bin #1",
  "type": "General",
  "status": "Empty",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "capacity": 100,
  "currentLevel": 0,
  "lastEmptied": "2024-10-22T10:30:00Z",
  "createdAt": "2024-10-22T08:00:00Z"
}
```

---

## ✅ Verification Steps

### Test 1: Check Railway Logs
1. Go to Railway dashboard
2. Check **"Deploy Logs"** tab
3. Look for: `MongoDB Connected: smart-waste-cluster.xxxxx.mongodb.net`

### Test 2: API Health Check
```bash
curl https://your-railway-url.up.railway.app/health
```
Should return status "OK" without database errors.

### Test 3: Database Connection
```bash
curl https://your-railway-url.up.railway.app/api/bins
```
Should return `[]` (empty array) initially.

---

## 🛠 Troubleshooting

### Issue: "Authentication failed"
**Solution**: 
- Double-check username and password in connection string
- Ensure user has "Read and write to any database" permissions

### Issue: "Connection timeout" 
**Solution**:
- Verify Network Access allows `0.0.0.0/0`
- Check if cluster is in "Active" state

### Issue: "Database name not found"
**Solution**:
- MongoDB automatically creates databases on first write
- Add `/smart_waste_management` to your connection string

### Issue: Railway still showing connection errors
**Solution**:
```bash
# Check Railway environment variables
railway variables

# View real-time logs
railway logs
```

---

## 🚀 Seed Your Database

Once connected, you can populate with sample data:

### Option 1: Use Seed Script
```bash
# If you have Railway CLI installed
railway run npm run seed
```

### Option 2: Manual API Calls
```bash
# Add a sample bin
curl -X POST https://your-railway-url.up.railway.app/api/bins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Park Bin",
    "type": "General",
    "status": "Empty",
    "location": {
      "latitude": 40.7829,
      "longitude": -73.9654,
      "address": "Central Park, New York, NY"
    }
  }'
```

---

## 📊 MongoDB Atlas Dashboard Features

### Monitoring
- **Metrics**: View database performance
- **Real-time**: Monitor active connections
- **Alerts**: Set up notifications for issues

### Data Management  
- **Data Explorer**: Browse collections and documents
- **Aggregation Pipeline Builder**: Create complex queries
- **Import/Export**: Backup and restore data

### Security
- **Database Users**: Manage access credentials
- **Network Access**: Control IP whitelist
- **Encryption**: Data encrypted at rest and in transit

---

## 💡 Best Practices

### Security
- ✅ Use strong, unique passwords
- ✅ Rotate database passwords regularly  
- ✅ Monitor access logs in Atlas dashboard
- ✅ Never commit connection strings to Git

### Performance
- ✅ Create indexes for frequently queried fields
- ✅ Monitor connection pool usage
- ✅ Use connection string with proper timeout settings

### Backup
- ✅ Enable continuous backup (automatic in Atlas)
- ✅ Test restore procedures periodically
- ✅ Export critical data regularly

---

## 🔗 Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js MongoDB Driver](https://docs.mongodb.com/drivers/node/)
- [MongoDB Query Language](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

## ✅ Success Checklist

After completing this guide, you should have:

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster deployed
- [ ] Database user with read/write permissions
- [ ] Network access configured for Railway (0.0.0.0/0)
- [ ] Connection string copied and secured
- [ ] MONGO_URI environment variable set in Railway  
- [ ] Railway application successfully connects to database
- [ ] Health check endpoint responds without errors
- [ ] API endpoints can read/write data

---

**🎉 Congratulations!** 

Your Smart Waste Management System now has a fully configured MongoDB Atlas database. Your Railway backend can store and retrieve waste bin data, user information, and collection records in a secure, scalable cloud database.

**Next Steps:**
1. Test your API endpoints with sample data
2. Update your Netlify frontend with the Railway API URL
3. Monitor your application performance in both Railway and MongoDB Atlas dashboards