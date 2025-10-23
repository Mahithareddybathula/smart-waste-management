// Smart Waste Management System - JavaScript
// Author: Smart Waste Management Team
// Version: 2.0.0 - Fixed Geolocation and Map Functionality

// ===== CONFIGURATION =====
const CONFIG = {
  API_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : window.API_BASE_URL ||
        "https://smart-waste-management-production.up.railway.app/api",
  MAP_DEFAULT_CENTER: { lat: 16.3164, lng: 80.4248 }, // Vijayawada, India
  MAP_DEFAULT_ZOOM: 13,
  GEOLOCATION_TIMEOUT: 10000,
  NEARBY_RADIUS: 5, // km
  MAX_LOCATION_AGE: 600000, // 10 minutes
};

// ===== GLOBAL VARIABLES =====
let map = null;
let userLocation = null;
let currentMarkers = [];
let userMarker = null;
let selectedLocation = null;
let allBins = [];

// ===== UTILITY FUNCTIONS =====

/**
 * Display notification messages to the user
 */
function showAlert(message, type = "info") {
  // Remove existing alerts first
  const existingAlerts = document.querySelectorAll(".alert");
  existingAlerts.forEach((alert) => alert.remove());

  const alertContainer =
    document.getElementById("alert-container") || createAlertContainer();

  const alertElement = document.createElement("div");
  alertElement.className = `alert alert-${type} fade-in`;
  alertElement.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer; color: inherit;">&times;</button>
    `;

  alertContainer.appendChild(alertElement);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertElement.parentNode) {
      alertElement.remove();
    }
  }, 5000);
}

/**
 * Create alert container if it doesn't exist
 */
function createAlertContainer() {
  const container = document.createElement("div");
  container.id = "alert-container";
  container.style.cssText =
    "position: fixed; top: 80px; right: 20px; z-index: 10000; max-width: 400px;";
  document.body.appendChild(container);
  return container;
}

/**
 * Show loading spinner
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const existingSpinner = container.querySelector(".loading-spinner");
    if (!existingSpinner) {
      const spinner = document.createElement("div");
      spinner.className = "loading-spinner";
      container.appendChild(spinner);
    }
  }
}

/**
 * Hide loading spinner
 */
function hideLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const spinner = container.querySelector(".loading-spinner");
    if (spinner) {
      spinner.remove();
    }
  }
}

/**
 * Format date for display
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ===== API FUNCTIONS =====

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    console.log("Making API request to:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log("API response:", data);

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);

    // Check if it's a network error
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      showAlert(
        "Cannot connect to server. Please make sure the server is running on port 5000.",
        "error",
      );
    }

    throw error;
  }
}

/**
 * Fetch all bins from the API
 */
async function fetchBins() {
  try {
    const response = await apiRequest("/bins");
    return response.data || [];
  } catch (error) {
    showAlert("Failed to fetch bins. Using demo mode.", "warning");
    // Return demo data if API fails
    return getDemoData();
  }
}

/**
 * Add a new bin to the database
 */
async function addBin(binData) {
  try {
    const response = await apiRequest("/bins", {
      method: "POST",
      body: JSON.stringify(binData),
    });
    return response.data;
  } catch (error) {
    showAlert(`Failed to add bin: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Update bin status
 */
async function updateBinStatus(binId, status) {
  try {
    const response = await apiRequest(`/bins/${binId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return response.data;
  } catch (error) {
    showAlert(`Failed to update bin: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Delete a bin
 */
async function deleteBin(binId) {
  try {
    const response = await apiRequest(`/bins/${binId}`, {
      method: "DELETE",
    });
    return response.data;
  } catch (error) {
    showAlert(`Failed to delete bin: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Get demo data for offline/demo mode
 */
function getDemoData() {
  return [
    {
      _id: "demo1",
      latitude: 40.7128,
      longitude: -74.006,
      status: "Empty",
      addedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "demo2",
      latitude: 40.7589,
      longitude: -73.9851,
      status: "Half-Full",
      addedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "demo3",
      latitude: 40.7505,
      longitude: -73.9934,
      status: "Full",
      addedAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

// ===== GEOLOCATION FUNCTIONS =====

/**
 * Get user's current location with better error handling
 */
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    console.log("Attempting to get user location...");

    if (!navigator.geolocation) {
      const error = new Error("Geolocation is not supported by this browser");
      console.error(error.message);
      reject(error);
      return;
    }

    // Show loading message
    showAlert("Getting your location...", "info");

    const options = {
      enableHighAccuracy: true,
      timeout: CONFIG.GEOLOCATION_TIMEOUT,
      maximumAge: CONFIG.MAX_LOCATION_AGE,
    };

    const successCallback = (position) => {
      console.log("Location obtained:", position);
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      userLocation = location;
      console.log("User location set:", userLocation);
      showAlert(
        `Location found! Accuracy: ${Math.round(location.accuracy)}m`,
        "success",
      );
      resolve(location);
    };

    const errorCallback = (error) => {
      console.error("Geolocation error:", error);
      let errorMessage = "Failed to get location: ";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage +=
            "Permission denied. Please allow location access and try again.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage +=
            "Position unavailable. Please check your GPS/internet connection.";
          break;
        case error.TIMEOUT:
          errorMessage += "Request timeout. Please try again.";
          break;
        default:
          errorMessage += "Unknown error occurred.";
          break;
      }

      showAlert(errorMessage, "error");
      reject(new Error(errorMessage));
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options,
    );
  });
}

/**
 * Check if geolocation is available and prompt user
 */
async function checkGeolocationSupport() {
  if (!navigator.geolocation) {
    showAlert(
      "Geolocation is not supported by your browser. Using default location.",
      "warning",
    );
    return false;
  }

  // Check permissions
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      console.log("Geolocation permission state:", permission.state);

      if (permission.state === "denied") {
        showAlert(
          "Location access is blocked. Please enable it in your browser settings.",
          "warning",
        );
        return false;
      }
    } catch (error) {
      console.log("Could not query geolocation permission:", error);
    }
  }

  return true;
}

// ===== MAP FUNCTIONS =====

/**
 * Initialize map with Leaflet
 */
function initializeMap(
  containerId,
  center = CONFIG.MAP_DEFAULT_CENTER,
  zoom = CONFIG.MAP_DEFAULT_ZOOM,
) {
  return new Promise((resolve, reject) => {
    console.log("🗺️ Initializing map...");
    console.log("Container ID:", containerId);
    console.log("Center:", center);
    console.log("Zoom:", zoom);
    console.log("Leaflet available:", typeof L !== "undefined");

    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
      console.error(`❌ Map container with ID '${containerId}' not found`);
      reject(new Error("Map container not found"));
      return;
    }

    console.log("✅ Map container found:", mapContainer);
    console.log(
      "Container dimensions:",
      mapContainer.offsetWidth,
      "x",
      mapContainer.offsetHeight,
    );

    // Clear any existing map content
    mapContainer.innerHTML = "";

    // Add loading indicator
    mapContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 400px; background: #f8f9fa; border-radius: 8px;">
        <div style="text-align: center;">
          <div style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;">🗺️</div>
          <p style="margin: 0; color: #666;">Initializing map...</p>
        </div>
      </div>
    `;

    try {
      console.log("🚀 Creating Leaflet map instance...");

      // Wait a bit for container to be ready
      setTimeout(() => {
        try {
          // Initialize Leaflet map
          const mapInstance = L.map(containerId, {
            center: [center.lat, center.lng],
            zoom: zoom,
            zoomControl: true,
            attributionControl: true,
          });

          // Set both local and global references immediately
          map = mapInstance;
          window.map = mapInstance;

          console.log("✅ Map initialized and window.map set:", !!window.map);
          console.log("✅ Map methods available:", {
            setView: typeof window.map.setView,
            getCenter: typeof window.map.getCenter,
          });

          // Add OpenStreetMap tiles
          const tileLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
              subdomains: ["a", "b", "c"],
            },
          );

          tileLayer.addTo(mapInstance);
          console.log("✅ Tile layer added");

          // Force map to resize and invalidate
          setTimeout(() => {
            mapInstance.invalidateSize();
            console.log("✅ Map size invalidated");
          }, 100);

          // Set up resize observer for responsive behavior
          if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
              mapInstance.invalidateSize();
            });
            resizeObserver.observe(mapContainer);
          }

          // Handle window resize events
          window.addEventListener("resize", () => {
            setTimeout(() => {
              mapInstance.invalidateSize();
            }, 100);
          });

          // Add click event listener for adding bins
          mapInstance.on("click", function (e) {
            console.log("Map clicked at:", e.latlng);
            if (document.body.classList.contains("add-bin-mode")) {
              selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
              updateLocationInputs(selectedLocation);
              addTempMarker(selectedLocation);
              showAlert(
                "Location selected! You can now choose the bin status.",
                "success",
              );
            }
          });

          // Map ready event - resolve promise here
          mapInstance.whenReady(function () {
            console.log("✅ Map is fully ready and operational");
            window.map = mapInstance; // Ensure global reference is set
            map = mapInstance; // Ensure local reference is set

            // Clear loading message
            const loadingDiv = mapContainer.querySelector(".map-loading");
            if (loadingDiv) {
              loadingDiv.remove();
            }

            showAlert("Map loaded successfully!", "success");

            // Force another resize after ready
            setTimeout(() => {
              mapInstance.invalidateSize();
              console.log("✅ Final map resize completed");

              // Additional resize for find page
              if (document.body.classList.contains("find-page")) {
                setTimeout(() => {
                  mapInstance.invalidateSize();
                  console.log("✅ Find page specific resize completed");
                }, 300);
              }

              resolve(mapInstance);
            }, 200);
          });

          console.log(
            "✅ Map initialized successfully, waiting for ready event",
          );
        } catch (innerError) {
          console.error("❌ Inner map initialization error:", innerError);
          mapContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e74c3c; background: #fadbd8; border-radius: 8px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
              <p>Map initialization failed: ${innerError.message}</p>
              <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
            </div>
          `;
          reject(innerError);
        }
      }, 250);
    } catch (error) {
      console.error("❌ Error initializing map:", error);
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const debugButton = isLocalhost
        ? '<button onclick="window.debugMapIssue()" class="btn btn-secondary" style="margin-left: 10px;">Debug</button>'
        : "";

      mapContainer.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #e74c3c; background: #fadbd8; border-radius: 8px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
              <p>Failed to load map: ${error.message}</p>
              <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
              ${debugButton}
          </div>
      `;
      reject(error);
    }
  });
}

/**
 * Add user location marker to map
 */
function addUserMarker(location) {
  if (!map) return;

  console.log("Adding user marker at:", location);

  if (userMarker) {
    map.removeLayer(userMarker);
  }

  userMarker = L.marker([location.lat, location.lng], {
    icon: L.divIcon({
      className: "user-marker",
      html: `
                <div style="
                    background: #007bff;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    position: relative;
                    animation: pulse 2s infinite;
                "></div>
            `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
  }).addTo(map);

  const accuracyText = location.accuracy
    ? ` (±${Math.round(location.accuracy)}m)`
    : "";
  userMarker.bindPopup(`<strong>📍 Your Location</strong>${accuracyText}`);

  // Center map on user location
  map.setView([location.lat, location.lng], 15);
}

/**
 * Add temporary marker for selected location
 */
function addTempMarker(location) {
  if (!map) return;

  console.log("Adding temp marker at:", location);

  // Remove existing temp marker
  map.eachLayer(function (layer) {
    if (layer.options && layer.options.temp) {
      map.removeLayer(layer);
    }
  });

  // Add new temp marker
  const tempMarker = L.marker([location.lat, location.lng], {
    temp: true,
    icon: L.divIcon({
      className: "temp-marker",
      html: `
                <div style="
                    background: #ff6b6b;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                ">📍</div>
            `,
      iconSize: [25, 25],
      iconAnchor: [12, 12],
    }),
  }).addTo(map);

  tempMarker.bindPopup("📍 Selected Location");
}

/**
 * Get status color for bin markers
 */
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "empty":
      return "#27ae60";
    case "half-full":
      return "#f39c12";
    case "full":
      return "#e74c3c";
    default:
      return "#95a5a6";
  }
}

/**
 * Get status emoji for bin markers
 */
function getStatusEmoji(status) {
  switch (status.toLowerCase()) {
    case "empty":
      return "🟢";
    case "half-full":
      return "🟡";
    case "full":
      return "🔴";
    default:
      return "⚪";
  }
}

/**
 * Add bin markers to the map
 */
function addBinMarkers(bins) {
  if (!map) {
    console.error("Map not initialized");
    return;
  }

  console.log("Adding bin markers:", bins.length);

  // Clear existing markers
  clearBinMarkers();

  bins.forEach((bin, index) => {
    try {
      const marker = L.marker([bin.latitude, bin.longitude], {
        icon: L.divIcon({
          className: "bin-marker",
          html: `
                        <div style="
                            background: ${getStatusColor(bin.status)};
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 16px;
                            cursor: pointer;
                        ">${getStatusEmoji(bin.status)}</div>
                    `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(map);

      // Create popup content
      const distance = userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            bin.latitude,
            bin.longitude,
          ).toFixed(2)
        : "Unknown";

      const popupContent = `
                <div class="bin-popup" style="min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: #2c3e50;">🗑️ Waste Bin</h4>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge status-${bin.status.toLowerCase().replace("-", "-")}">${bin.status}</span></p>
                    <p style="margin: 5px 0;"><strong>Distance:</strong> ${distance} km</p>
                    <p style="margin: 5px 0;"><strong>Added:</strong> ${formatDate(bin.addedAt)}</p>
                    <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
                        <button onclick="openNavigation(${bin.latitude}, ${bin.longitude})" class="btn btn-small btn-primary" style="font-size: 12px; padding: 5px 10px;">📍 Go Here</button>
                        <button onclick="updateBinDialog('${bin._id}', '${bin.status}')" class="btn btn-small btn-secondary" style="font-size: 12px; padding: 5px 10px;">✏️ Update</button>
                        <button onclick="confirmDeleteBin('${bin._id}')" class="btn btn-small btn-danger" style="font-size: 12px; padding: 5px 10px;">🗑️ Delete</button>
                    </div>
                </div>
            `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "bin-popup-container",
      });

      currentMarkers.push(marker);
    } catch (error) {
      console.error(`Error adding marker for bin ${index}:`, error);
    }
  });

  console.log(`Added ${currentMarkers.length} markers to map`);
}

/**
 * Clear all bin markers from the map
 */
function clearBinMarkers() {
  if (!map) return;

  currentMarkers.forEach((marker) => {
    try {
      map.removeLayer(marker);
    } catch (error) {
      console.error("Error removing marker:", error);
    }
  });
  currentMarkers = [];
}

// ===== UI FUNCTIONS =====

/**
 * Update location input fields
 */
function updateLocationInputs(location) {
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");

  if (latInput) latInput.value = location.lat.toFixed(6);
  if (lngInput) lngInput.value = location.lng.toFixed(6);

  console.log("Location inputs updated:", location);
}

/**
 * Open navigation to specific coordinates
 */
function openNavigation(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
  showAlert("Opening navigation...", "info");
}

/**
 * Show update bin dialog
 */
function updateBinDialog(binId, currentStatus) {
  const statuses = ["Empty", "Half-Full", "Full"];
  let options = statuses
    .map((status) =>
      status === currentStatus ? `${status} (current)` : status,
    )
    .join("\n");

  const newStatus = prompt(
    `Update bin status:\n${options}\n\nEnter new status:`,
    currentStatus,
  );

  if (
    newStatus &&
    statuses.includes(newStatus) &&
    newStatus !== currentStatus
  ) {
    updateBinStatus(binId, newStatus)
      .then(() => {
        showAlert("Bin status updated successfully!", "success");
        loadBinsData();
      })
      .catch((error) => {
        console.error("Update error:", error);
      });
  } else if (newStatus !== null && !statuses.includes(newStatus)) {
    showAlert(
      "Invalid status. Please choose Empty, Half-Full, or Full.",
      "error",
    );
  }
}

/**
 * Confirm bin deletion
 */
function confirmDeleteBin(binId) {
  if (
    confirm(
      "Are you sure you want to delete this bin? This action cannot be undone.",
    )
  ) {
    deleteBin(binId)
      .then(() => {
        showAlert("Bin deleted successfully!", "success");
        loadBinsData();
      })
      .catch((error) => {
        console.error("Delete error:", error);
      });
  }
}

/**
 * Load and display bins data
 */
async function loadBinsData() {
  try {
    console.log("Loading bins data...");
    showLoading("map-container");

    const bins = await fetchBins();
    allBins = bins;
    console.log("Loaded bins:", bins);

    if (map) {
      addBinMarkers(bins);
    }

    updateStatistics(bins);
    hideLoading("map-container");

    return bins;
  } catch (error) {
    console.error("Error loading bins:", error);
    hideLoading("map-container");
    return [];
  }
}

/**
 * Update statistics display
 */
function updateStatistics(bins) {
  const stats = {
    total: bins.length,
    empty: bins.filter((bin) => bin.status === "Empty").length,
    halfFull: bins.filter((bin) => bin.status === "Half-Full").length,
    full: bins.filter((bin) => bin.status === "Full").length,
  };

  // Update stat elements if they exist
  const statElements = {
    "total-bins": stats.total,
    "empty-bins": stats.empty,
    "half-full-bins": stats.halfFull,
    "full-bins": stats.full,
    "visible-total": stats.total,
    "visible-empty": stats.empty,
    "visible-half-full": stats.halfFull,
    "visible-full": stats.full,
  };

  Object.entries(statElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  console.log("Statistics updated:", stats);
}

// ===== PAGE-SPECIFIC FUNCTIONS =====

/**
 * Initialize Find Nearby Bins page
 */
async function initializeFindPage() {
  console.log("Initializing Find Nearby Bins page...");

  // Wait for DOM to be fully ready
  await new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve, { once: true });
    }
  });

  // Initialize map first
  const mapElement = document.getElementById("map-container");
  if (mapElement) {
    mapElement.innerHTML =
      '<div class="map-loading"><div><i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;"></i><p>Loading map...</p></div></div>';
  }

  // Wait for Leaflet to be available
  let leafletReady = false;
  let attempts = 0;
  while (!leafletReady && attempts < 50) {
    if (typeof L !== "undefined") {
      leafletReady = true;
      console.log("✅ Leaflet is ready");
    } else {
      console.log(`⏳ Waiting for Leaflet (attempt ${attempts + 1}/50)`);
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  if (!leafletReady) {
    console.error("❌ Leaflet failed to load");
    showAlert("Map library failed to load. Please refresh the page.", "error");
    return;
  }

  // Initialize map with proper async handling
  console.log("🗺️ Starting map initialization...");

  // Add debug info
  console.log("CONFIG available:", typeof CONFIG !== "undefined");
  console.log("CONFIG value:", CONFIG);

  try {
    const mapInstance = await initializeMap("map-container");

    if (mapInstance) {
      window.map = mapInstance;
      map = mapInstance; // Set local reference too
      console.log("✅ Map instance set to window.map");

      // Make functions globally available for find.html coordination
      window.addBinMarkersToMap = addBinMarkers;
      window.addUserLocationToMap = () => {
        if (userLocation) {
          addUserMarker(userLocation);
        }
      };
      window.loadBinsOnMap = loadBinsData;

      // Set up global addBinMarkers function for filtering
      window.addBinMarkers = addBinMarkers;
    } else {
      console.error("❌ Map initialization failed - no instance returned");
      showAlert("Map initialization failed. Please refresh the page.", "error");
      return;
    }
  } catch (error) {
    console.error("❌ Map initialization failed:", error);
    showAlert("Map initialization failed. Please refresh the page.", "error");
    return;
  }

  // Check geolocation support
  const hasGeolocation = await checkGeolocationSupport();

  if (hasGeolocation) {
    try {
      // Get user location
      const location = await getCurrentLocation();

      // Add user marker and center map
      addUserMarker(location);

      showAlert("Location detected! Loading nearby bins...", "success");
    } catch (error) {
      console.error("Location error:", error);
      showAlert(
        "Using default location. You can still view and add bins!",
        "info",
      );
    }
  } else {
    showAlert(
      "Using default location. You can still view and add bins!",
      "info",
    );
  }

  // Load bins data
  await loadBinsData();

  // Initialize find page specific data
  if (typeof window.allBins !== "undefined") {
    window.allBins = allBins;
    window.filteredBins = allBins;
    updateVisibleStats(allBins);
  }
}

/**
 * Initialize Add Bin page
 */
async function initializeAddPage() {
  console.log("Initializing Add Bin page...");

  // Initialize map
  initializeMap("map-container");

  // Enable add bin mode
  document.body.classList.add("add-bin-mode");

  // Check geolocation support
  const hasGeolocation = await checkGeolocationSupport();

  if (hasGeolocation) {
    try {
      // Try to get user location
      const location = await getCurrentLocation();
      addUserMarker(location);
      updateLocationInputs(location);
      selectedLocation = location;
      addTempMarker(location);

      showAlert(
        "Current location detected! Click elsewhere on the map to choose a different location.",
        "success",
      );
    } catch (error) {
      console.error("Location error:", error);
      showAlert(
        "Please click on the map to select a location for the new bin.",
        "info",
      );
    }
  } else {
    showAlert(
      "Please click on the map to select a location for the new bin.",
      "info",
    );
  }
}

/**
 * Handle add bin form submission
 */
async function handleAddBin(event) {
  event.preventDefault();
  console.log("Handling add bin form submission...");

  const form = event.target;
  const formData = new FormData(form);

  const binData = {
    latitude: parseFloat(formData.get("latitude")),
    longitude: parseFloat(formData.get("longitude")),
    status: formData.get("status"),
  };

  console.log("Bin data to submit:", binData);

  // Validate data
  if (!binData.latitude || !binData.longitude || !binData.status) {
    showAlert(
      "Please fill in all fields. Make sure to select a location on the map.",
      "error",
    );
    return;
  }

  if (isNaN(binData.latitude) || isNaN(binData.longitude)) {
    showAlert(
      "Invalid coordinates. Please select a location on the map.",
      "error",
    );
    return;
  }

  if (
    binData.latitude < -90 ||
    binData.latitude > 90 ||
    binData.longitude < -180 ||
    binData.longitude > 180
  ) {
    showAlert(
      "Invalid coordinates range. Please select a valid location.",
      "error",
    );
    return;
  }

  try {
    showAlert("Adding bin to the map...", "info");
    const newBin = await addBin(binData);
    showAlert("Bin added successfully! 🎉", "success");

    // Reset form
    form.reset();
    selectedLocation = null;

    // Clear temp marker
    if (map) {
      map.eachLayer(function (layer) {
        if (layer.options && layer.options.temp) {
          map.removeLayer(layer);
        }
      });
    }

    // Show success and redirect
    setTimeout(() => {
      showAlert("Redirecting to find bins page...", "info");
      setTimeout(() => {
        window.location.href = "find.html";
      }, 1500);
    }, 2000);
  } catch (error) {
    console.error("Error adding bin:", error);
  }
}

/**
 * Use current location button handler
 */
async function useCurrentLocation() {
  console.log("Use current location button clicked");

  try {
    showAlert("Getting your current location...", "info");
    const location = await getCurrentLocation();

    selectedLocation = location;
    updateLocationInputs(location);

    if (map) {
      map.setView([location.lat, location.lng], 16);
      addUserMarker(location);
      addTempMarker(location);
    }

    showAlert("Current location selected! 📍", "success");
  } catch (error) {
    console.error("Error getting current location:", error);
  }
}

// ===== EVENT LISTENERS =====

/**
 * Initialize page based on current URL
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
  document.head.appendChild(style);

  // Determine which page we're on and initialize accordingly
  const path = window.location.pathname;
  const filename = path.split("/").pop() || "index.html";

  console.log("Current page:", filename);
  console.log("Full path:", path);

  // Check for find page - handle both find.html and /find routes
  const isFindPage =
    filename === "find.html" ||
    path.includes("/find") ||
    document.getElementById("map-container") !== null;

  // Check for add page - handle both add.html and /add routes
  const isAddPage =
    filename === "add.html" ||
    path.includes("/add") ||
    document.getElementById("add-bin-form") !== null;

  if (isFindPage) {
    console.log("Detected find page - initializing map");
    initializeFindPage();
  } else if (isAddPage) {
    console.log("Detected add page - initializing add functionality");
    initializeAddPage();

    // Add form submission handler
    const addBinForm = document.getElementById("add-bin-form");
    if (addBinForm) {
      addBinForm.addEventListener("submit", handleAddBin);
      console.log("Form submission handler attached");
    }

    // Add current location button handler
    const currentLocationBtn = document.getElementById("current-location-btn");
    if (currentLocationBtn) {
      currentLocationBtn.addEventListener("click", useCurrentLocation);
      console.log("Current location button handler attached");
    }
  } else {
    console.log("Homepage loaded - loading statistics");
    // Load statistics for homepage
    loadBinsData().then((bins) => {
      updateStatistics(bins);
    });
  }

  console.log("Page initialization complete");
});

// ===== FIND PAGE FUNCTIONS =====

/**
 * Update visible statistics for find page
 */
function updateVisibleStats(bins) {
  if (!bins) return;

  const stats = {
    total: bins.length,
    empty: bins.filter((bin) => bin.status === "Empty").length,
    halfFull: bins.filter((bin) => bin.status === "Half-Full").length,
    full: bins.filter((bin) => bin.status === "Full").length,
  };

  // Update find page specific elements
  const elements = {
    "visible-total": stats.total,
    "visible-empty": stats.empty,
    "visible-half-full": stats.halfFull,
    "visible-full": stats.full,
  };

  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  console.log("Find page stats updated:", stats);
}

/**
 * Refresh bins data for find page
 */
async function refreshBins() {
  console.log("Refreshing bins data...");
  showAlert("Refreshing bins data...", "info");

  try {
    await loadBinsData();

    // Update find page statistics
    updateVisibleStats(allBins);

    // Update global variables for find page
    if (typeof window.allBins !== "undefined") {
      window.allBins = allBins;
      window.filteredBins = allBins;
    }

    showAlert(`Refreshed! Found ${allBins.length} bins`, "success");
  } catch (error) {
    console.error("Error refreshing bins:", error);
    showAlert("Could not refresh data. Server may be offline.", "error");
  }
}

/**
 * Center map on user location
 */
async function centerOnUser() {
  console.log("📍 Centering on user location...");

  if (!navigator.geolocation) {
    showAlert("Geolocation not supported by your browser", "error");
    return;
  }

  if (!map) {
    showAlert("Map not ready. Please wait a moment and try again.", "warning");
    return;
  }

  showAlert("Getting your location...", "info");

  try {
    const position = await getCurrentLocation();
    const { lat, lng } = position;

    // Center map on user location
    map.setView([lat, lng], 15);

    // Add or update user location marker
    addUserMarker({ lat, lng });

    showAlert("Centered on your location! 📍", "success");
  } catch (error) {
    console.error("Location error:", error);
    let message = "Location error: ";

    if (error.code === 1) {
      message += "Permission denied. Please allow location access.";
    } else if (error.code === 2) {
      message += "Position unavailable. Check your connection.";
    } else if (error.code === 3) {
      message += "Request timeout. Please try again.";
    } else {
      message += "Unknown error occurred.";
    }

    showAlert(message, "error");
  }
}

/**
 * Share current location
 */
function shareLocation() {
  console.log("Sharing location...");

  const currentUrl = window.location.href;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        showAlert("Page URL copied to clipboard!", "success");
      })
      .catch(() => {
        showAlert(`Share this URL: ${currentUrl}`, "info");
      });
  } else {
    showAlert(`Share this URL: ${currentUrl}`, "info");
  }
}

// ===== DEBUG FUNCTIONS =====
// Debug function - only available in localhost
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.debugMapIssue = function () {
    console.log("🐛 DEBUG MAP ISSUE");
    console.log("Leaflet loaded:", typeof L !== "undefined");
    console.log(
      "Map container exists:",
      !!document.getElementById("map-container"),
    );
    console.log("window.map exists:", !!window.map);
    console.log("CONFIG exists:", typeof CONFIG !== "undefined");
    console.log("CONFIG value:", CONFIG);

    const container = document.getElementById("map-container");
    if (container) {
      console.log(
        "Container dimensions:",
        container.offsetWidth,
        "x",
        container.offsetHeight,
      );
      console.log("Container style:", container.style.cssText);
    }

    // Try to reinitialize
    if (typeof L !== "undefined" && CONFIG) {
      console.log("Attempting to reinitialize map...");
      initializeMap("map-container");
    }
  };
} else {
  // Production fallback - no debug functionality
  window.debugMapIssue = function () {
    console.log("Debug functionality disabled in production");
  };
}

// ===== GLOBAL FUNCTIONS (for onclick handlers) =====
window.openNavigation = openNavigation;
window.updateBinDialog = updateBinDialog;
window.confirmDeleteBin = confirmDeleteBin;
window.refreshBins = refreshBins;
window.centerOnUser = centerOnUser;
window.shareLocation = shareLocation;
window.updateVisibleStats = updateVisibleStats;
window.useCurrentLocation = useCurrentLocation;

// Export for other modules
window.smartWasteApp = {
  loadBinsData,
  updateStatistics,
  addBinMarkers: addBinMarkers,
  userLocation: () => userLocation,
  allBins: () => allBins,
};

console.log(
  "Smart Waste Management System - JavaScript loaded successfully! 🚀",
);
