const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const binRoutes = require("./routes/binRoutes");

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Set default environment variables if not provided
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/smart_waste_management";
process.env.PORT = process.env.PORT || "5000";
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/bins", binRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Smart Waste Management System API",
    version: "1.0.0",
    endpoints: {
      "GET /api/bins": "Get all bins",
      "POST /api/bins": "Add a new bin",
      "PUT /api/bins/:id": "Update bin status",
      "DELETE /api/bins/:id": "Delete a bin",
      "GET /api/bins/nearby": "Get nearby bins (query: lat, lng, radius)",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Smart Waste Management System API Server Started!
📡 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📊 API Base URL: http://localhost:${PORT}
📚 API Documentation: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/health
    `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;
