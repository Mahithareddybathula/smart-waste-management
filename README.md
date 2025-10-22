# Smart Waste Management System

A complete web application that helps users locate nearby waste bins and allows them to add new bins to a shared map. The system automatically detects user location using the browser's Geolocation API and shows nearby bins on an interactive map.

![Smart Waste Management System](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

- **Location-Based**: Automatically detects user's current location using Geolocation API
- **Interactive Maps**: Uses Leaflet + OpenStreetMap for interactive mapping
- **Real-Time Status**: Shows bin status (Empty 🟢, Half-Full 🟡, Full 🔴)
- **Navigation Integration**: "Go Here" button opens Google Maps navigation
- **Community-Driven**: Users can add new bins and update existing ones
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **RESTful API**: Complete backend API with CRUD operations
- **Real-Time Updates**: Instant updates when bins are added or modified

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ↔ Backend (Node.js/Express) ↔ Database (MongoDB)
```

- **Frontend**: Pure HTML, CSS, JavaScript with Leaflet for maps
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB for storing bin data
- **Maps**: Leaflet with OpenStreetMap tiles
- **Navigation**: Google Maps integration

## 📁 Project Structure

```
smart-waste-management/
│
├── backend/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   └── binRoutes.js       # API routes for bins
│   ├── models/
│   │   └── Bin.js             # MongoDB schema for bins
│   ├── config/
│   │   └── db.js              # Database connection
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── index.html             # Homepage
│   ├── find.html              # Find nearby bins page
│   ├── add.html               # Add new bin page
│   ├── styles.css             # Main stylesheet
│   └── script.js              # Frontend JavaScript
│
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 14.x or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (version 4.x or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-waste-management.git
   cd smart-waste-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   - Install MongoDB on your system
   - Start MongoDB service:
     ```bash
     # On Windows
     net start MongoDB
     
     # On macOS
     brew services start mongodb/brew/mongodb-community
     
     # On Linux
     sudo systemctl start mongod
     ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

4. **Configure environment variables**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Copy the .env file and edit it
   cp .env .env.local
   ```
   
   Edit `.env` file with your settings:
   ```env
   # For local MongoDB
   MONGO_URI=mongodb://localhost:27017/smart_waste_management
   
   # For MongoDB Atlas
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_waste_management
   
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the backend server**
   ```bash
   # From the root directory
   npm start
   
   # Or for development with auto-restart
   npm run dev
   ```

6. **Open the frontend**
   - Open `frontend/index.html` in your web browser
   - Or serve it using a local server:
     ```bash
     # Using Python 3
     cd frontend
     python -m http.server 3000
     
     # Using Node.js serve
     npx serve frontend -p 3000
     
     # Using VS Code Live Server extension
     # Right-click on index.html and select "Open with Live Server"
     ```

7. **Access the application**
   - Frontend: `http://localhost:3000` (or open index.html directly)
   - Backend API: `http://localhost:5000`
   - API Documentation: `http://localhost:5000`

## 📋 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Get All Bins
```http
GET /api/bins
```
**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64a7b2c3d4e5f6789",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "status": "Empty",
      "addedAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Add New Bin
```http
POST /api/bins
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "status": "Empty"
}
```

#### Update Bin Status
```http
PUT /api/bins/:id
Content-Type: application/json

{
  "status": "Half-Full"
}
```

#### Delete Bin
```http
DELETE /api/bins/:id
```

#### Get Nearby Bins
```http
GET /api/bins/nearby?lat=40.7128&lng=-74.0060&radius=5
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## 🎯 Usage Guide

### For Users

1. **Finding Bins**
   - Go to the "Find Nearby Bins" page
   - Allow location access when prompted
   - View bins on the interactive map
   - Click bin markers to see details and get directions

2. **Adding Bins**
   - Go to the "Add a Bin" page
   - Click "Use Current Location" or select on map
   - Choose the bin status (Empty, Half-Full, Full)
   - Submit the form

3. **Navigation**
   - Click "Go Here" on any bin popup
   - Opens Google Maps with turn-by-turn directions

### For Developers

#### Adding Sample Data
```javascript
// Add sample bins for testing
const sampleBins = [
  { latitude: 40.7128, longitude: -74.0060, status: 'Empty' },
  { latitude: 40.7589, longitude: -73.9851, status: 'Half-Full' },
  { latitude: 40.7505, longitude: -73.9934, status: 'Full' }
];

// POST to /api/bins for each sample bin
```

#### Database Schema
```javascript
const binSchema = {
  latitude: Number,     // Required, -90 to 90
  longitude: Number,    // Required, -180 to 180
  status: String,       // Required, enum: ['Empty', 'Half-Full', 'Full']
  addedAt: Date,        // Auto-generated
  updatedAt: Date       // Auto-updated
}
```

## 🧪 Testing

### Manual Testing Checklist

**Frontend Tests:**
- [ ] Homepage loads correctly
- [ ] Navigation works between pages
- [ ] Maps load on find.html and add.html
- [ ] Geolocation permission request works
- [ ] Form validation works on add.html
- [ ] Responsive design works on mobile

**Backend Tests:**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] GET /api/bins returns data
- [ ] POST /api/bins creates new bin
- [ ] PUT /api/bins/:id updates bin
- [ ] DELETE /api/bins/:id removes bin

**Integration Tests:**
- [ ] Frontend can fetch bins from API
- [ ] Frontend can add new bins via API
- [ ] Map markers update after adding bin
- [ ] Navigation links work correctly

### API Testing with curl

```bash
# Get all bins
curl http://localhost:5000/api/bins

# Add a new bin
curl -X POST http://localhost:5000/api/bins \
  -H "Content-Type: application/json" \
  -d '{"latitude":40.7128,"longitude":-74.0060,"status":"Empty"}'

# Update bin status
curl -X PUT http://localhost:5000/api/bins/BIN_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"Full"}'
```

## 🚀 Deployment

### Local Development
```bash
# Backend
npm start

# Frontend (choose one)
# Option 1: Open index.html directly in browser
open frontend/index.html

# Option 2: Use a local server
cd frontend && python -m http.server 3000
```

### Production Deployment

**Backend (Heroku):**
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set MONGO_URI=your_mongodb_uri`
3. Deploy: `git push heroku main`

**Frontend (Netlify/Vercel):**
1. Build production files
2. Update API base URL in script.js
3. Deploy frontend folder

**Database (MongoDB Atlas):**
1. Create cluster at mongodb.com
2. Get connection string
3. Update MONGO_URI in environment variables

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/smart_waste_management` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT secret (future use) | `your_secret_here` |

### Frontend Configuration

Edit `CONFIG` object in `script.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    MAP_DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 },
    MAP_DEFAULT_ZOOM: 13,
    GEOLOCATION_TIMEOUT: 10000,
    NEARBY_RADIUS: 5 // km
};
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

### Development Guidelines

- Follow consistent code formatting
- Add comments for complex functions
- Test all changes before submitting
- Update README if adding new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**2. Geolocation Not Working**
```
Error: User denied Geolocation
```
**Solution:** 
- Use HTTPS in production
- Check browser location permissions
- Test with different browsers

**3. CORS Errors**
```
Access to fetch at 'http://localhost:5000' from origin 'file://' has been blocked
```
**Solution:**
- Use a local server instead of opening HTML files directly
- Backend already includes CORS headers

**4. Map Not Loading**
```
Error: Map container not found
```
**Solution:**
- Check that Leaflet CSS and JS are loaded
- Verify map container div exists
- Check for JavaScript errors in console

### Getting Help

- Check the [Issues](https://github.com/yourusername/smart-waste-management/issues) page
- Create a new issue with:
  - Error message
  - Steps to reproduce
  - Browser and OS information
  - Screenshot if applicable

## 📊 Performance

- **Frontend**: Lightweight vanilla JavaScript
- **Backend**: Express.js with minimal middleware
- **Database**: MongoDB with indexed queries
- **Maps**: Efficient marker clustering for large datasets

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Push notifications for nearby full bins
- [ ] Admin panel for bin management
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced analytics and reporting
- [ ] Integration with waste collection services
- [ ] Offline support with Service Workers
- [ ] Multi-language support

## 📞 Support

For support and questions:
- Email: support@smartwaste.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/smart-waste-management/issues)
- Documentation: This README file

---

**Made with ❤️ for a cleaner, more sustainable world! 🌍♻️**