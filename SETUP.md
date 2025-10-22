# Smart Waste Management System - Complete Setup Guide

🌍 **A comprehensive web application for community-driven waste bin management**

## 📋 Project Overview

The Smart Waste Management System is a full-stack web application that helps communities efficiently manage waste bins through:

- **Interactive Maps**: Find nearby bins with real-time status updates
- **Location Detection**: Automatic GPS-based location detection
- **Community Features**: Add new bins and update existing ones
- **Navigation Integration**: Get directions to any bin location
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Leaflet Maps
- **Backend**: Node.js, Express.js, RESTful API
- **Database**: MongoDB with Mongoose ODM
- **Maps**: OpenStreetMap with Leaflet.js
- **Styling**: Custom CSS with responsive design

## 📁 Project Structure

```
smart-waste-management/
├── backend/
│   ├── server.js           # Express server entry point
│   ├── routes/
│   │   └── binRoutes.js    # API routes for bin operations
│   ├── models/
│   │   └── Bin.js          # MongoDB schema
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── sample-data.js      # Sample data for testing
│   └── .env                # Environment variables
├── frontend/
│   ├── index.html          # Homepage
│   ├── find.html           # Find nearby bins
│   ├── add.html            # Add new bin
│   ├── styles.css          # Main stylesheet
│   └── script.js           # Frontend JavaScript
├── package.json            # Dependencies and scripts
├── seed.js                 # Database seeding script
├── test-api.js             # API testing utilities
└── README.md               # Detailed documentation
```

## 🚀 Quick Setup (5 Minutes)

### Step 1: Prerequisites Check
Ensure you have installed:
- [Node.js](https://nodejs.org/) (v14+ required)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4+ required)

### Step 2: Install Dependencies
```bash
cd smart-waste-management
npm install
```

### Step 3: Start MongoDB
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 4: Set Up Database
```bash
npm run seed
```
This creates sample bins for testing.

### Step 5: Start the Server
```bash
npm start
```
Server will run on http://localhost:5000

### Step 6: Open the Application
- Open `frontend/index.html` in your browser
- Or use a local server: `cd frontend && python -m http.server 3000`

## 🔧 Configuration Options

### Environment Variables (backend/.env)
```env
MONGO_URI=mongodb://localhost:27017/smart_waste_management
PORT=5000
NODE_ENV=development
```

### Frontend Configuration (script.js)
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    MAP_DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 },
    MAP_DEFAULT_ZOOM: 13
};
```

## 🧪 Testing the Application

### 1. Test API Endpoints
```bash
# Run comprehensive API tests
node test-api.js

# Test specific endpoints
node test-api.js health    # Health check
node test-api.js get       # Get all bins
node test-api.js add       # Add sample bin
```

### 2. Manual Testing Checklist
- [ ] Homepage loads and shows statistics
- [ ] "Find Nearby Bins" detects location and shows map
- [ ] Map displays bin markers with correct colors
- [ ] Clicking markers shows bin details and "Go Here" button
- [ ] "Add a Bin" allows location selection and form submission
- [ ] New bins appear immediately on the map
- [ ] Mobile responsive design works correctly

### 3. Browser Testing
Test in multiple browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 Usage Guide

### For End Users

**Finding Bins:**
1. Click "Find Nearby Bins"
2. Allow location access when prompted
3. View bins on the interactive map
4. Click any bin marker for details
5. Use "Go Here" for navigation

**Adding Bins:**
1. Click "Add a Bin"
2. Use "Current Location" or click on map
3. Select bin status (Empty/Half-Full/Full)
4. Submit the form

### For Developers

**API Endpoints:**
- `GET /api/bins` - Get all bins
- `POST /api/bins` - Add new bin
- `PUT /api/bins/:id` - Update bin status
- `DELETE /api/bins/:id` - Delete bin
- `GET /api/bins/nearby` - Get nearby bins

**Database Schema:**
```javascript
{
  latitude: Number,    // -90 to 90
  longitude: Number,   // -180 to 180
  status: String,      // "Empty", "Half-Full", "Full"
  addedAt: Date,       // Auto-generated
  updatedAt: Date      // Auto-updated
}
```

## 🚀 Deployment Options

### Option 1: Local Development
- Backend: `npm start`
- Frontend: Open HTML files or use local server

### Option 2: Heroku (Backend)
```bash
heroku create your-app-name
heroku config:set MONGO_URI=your_mongodb_atlas_uri
git push heroku main
```

### Option 3: Netlify/Vercel (Frontend)
1. Update API_BASE_URL in script.js
2. Deploy frontend folder to Netlify or Vercel

### Option 4: MongoDB Atlas (Database)
1. Create cluster at mongodb.com/atlas
2. Get connection string
3. Update MONGO_URI in .env

## 🛠️ Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- For local: `mongodb://localhost:27017/smart_waste_management`

### Issue 2: Geolocation Not Working
```
Error: User denied Geolocation
```
**Solutions:**
- Use HTTPS in production
- Check browser location permissions
- Test with different browsers

### Issue 3: CORS Errors
```
Access blocked by CORS policy
```
**Solutions:**
- Use local server instead of opening HTML directly
- Backend includes CORS headers by default

### Issue 4: Map Not Loading
**Solutions:**
- Check internet connection for map tiles
- Verify Leaflet CSS/JS are loaded
- Check browser console for errors

## 📊 Performance Optimization

### Backend Optimizations
- MongoDB indexing on location fields
- Efficient query patterns for nearby bins
- Minimal middleware for faster responses

### Frontend Optimizations
- Lazy loading for map tiles
- Efficient marker clustering for large datasets
- Minimal DOM manipulation

### Database Optimizations
- Indexes on latitude, longitude, and status
- Efficient aggregation queries
- Connection pooling

## 🔮 Future Enhancements

**Planned Features:**
- [ ] User authentication system
- [ ] Push notifications for full bins
- [ ] Admin dashboard for management
- [ ] Mobile app (React Native)
- [ ] Real-time updates with WebSockets
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Offline functionality with PWA

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Create Pull Request

**Development Guidelines:**
- Follow existing code style
- Add comments for complex functions
- Test all changes before submitting
- Update documentation as needed

## 📞 Support & Resources

**Getting Help:**
- Check this SETUP.md file first
- Review README.md for detailed documentation
- Check existing GitHub Issues
- Create new issue with detailed description

**Useful Commands:**
```bash
npm start              # Start the server
npm run dev           # Development mode with auto-restart
npm run seed          # Populate database with sample data
npm run setup         # Install dependencies and seed database
node test-api.js      # Test API endpoints
```

**File Structure Reference:**
```
backend/server.js     → Main server file
backend/routes/       → API route definitions  
backend/models/       → Database schemas
frontend/index.html   → Homepage
frontend/find.html    → Find bins page
frontend/add.html     → Add bin page
frontend/styles.css   → Main stylesheet
frontend/script.js    → Frontend JavaScript
```

## ✅ Success Checklist

After setup, verify these work:
- [ ] Server starts without errors: `npm start`
- [ ] Database connection successful (check console logs)
- [ ] Homepage loads and shows statistics
- [ ] API endpoints respond: `curl http://localhost:5000/health`
- [ ] Maps load on find.html and add.html pages
- [ ] Location detection works (requires HTTPS for production)
- [ ] Can add new bins through the interface
- [ ] New bins appear on map immediately

## 🎯 Production Readiness

Before deploying to production:
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas for database
- [ ] Enable HTTPS for geolocation
- [ ] Update API URLs in frontend
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Set up automated backups
- [ ] Configure proper logging
- [ ] Add rate limiting for API endpoints

---

**🌍 Ready to make waste management smarter? Let's build a cleaner future together! 🚀**

For detailed technical documentation, see README.md
For API testing examples, see test-api.js
For sample data, see backend/sample-data.js