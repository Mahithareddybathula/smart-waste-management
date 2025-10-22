// Mobile-Specific Fixes for Smart Waste Management System
// Handles mobile browser quirks, geolocation issues, and API connectivity

(function () {
  "use strict";

  // Mobile detection
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Configuration with mobile-specific settings
  const MOBILE_CONFIG = {
    geolocation: {
      timeout: 15000, // Longer timeout for mobile
      maximumAge: 600000, // 10 minutes
      enableHighAccuracy: true,
    },
    api: {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    ui: {
      touchDelay: 300,
      scrollThreshold: 50,
    },
  };

  // Enhanced error logging for mobile debugging
  function logMobileError(error, context) {
    const errorInfo = {
      message: error.message || error,
      context: context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      isMobile: isMobile,
      isIOS: isIOS,
      isAndroid: isAndroid,
    };

    console.error("Mobile Error:", errorInfo);

    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem("mobile_errors") || "[]");
      errors.push(errorInfo);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      localStorage.setItem("mobile_errors", JSON.stringify(errors));
    } catch (e) {
      console.warn("Could not store error in localStorage:", e);
    }
  }

  // Enhanced geolocation for mobile devices
  function getMobileLocation(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error("Geolocation not supported on this device");
        logMobileError(error, "geolocation_not_supported");
        reject(error);
        return;
      }

      const mobileOptions = {
        ...MOBILE_CONFIG.geolocation,
        ...options,
      };

      let timeoutId;
      let resolved = false;

      // Custom timeout handling
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const error = new Error("Location request timed out");
          logMobileError(error, "geolocation_timeout");
          reject(error);
        }
      }, mobileOptions.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(position);
          }
        },
        (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);

            let errorMessage = "Location error: ";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  "Permission denied. Please enable location access in your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage +=
                  "Position unavailable. Please check your GPS/WiFi connection.";
                break;
              case error.TIMEOUT:
                errorMessage += "Request timed out. Please try again.";
                break;
              default:
                errorMessage += error.message || "Unknown error occurred.";
            }

            const customError = new Error(errorMessage);
            customError.code = error.code;
            logMobileError(customError, "geolocation_error");
            reject(customError);
          }
        },
        mobileOptions,
      );
    });
  }

  // Enhanced fetch with retry logic for mobile networks
  async function mobileFetch(url, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      MOBILE_CONFIG.api.timeout,
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic for mobile network issues
      if (retryCount < MOBILE_CONFIG.api.retryAttempts) {
        const isNetworkError =
          error.name === "AbortError" ||
          error.message.includes("fetch") ||
          error.message.includes("network");

        if (isNetworkError) {
          logMobileError(error, `api_retry_${retryCount + 1}`);

          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              MOBILE_CONFIG.api.retryDelay * (retryCount + 1),
            ),
          );

          return mobileFetch(url, options, retryCount + 1);
        }
      }

      logMobileError(error, "api_fetch_failed");
      throw error;
    }
  }

  // Mobile-optimized alert system
  function showMobileAlert(message, type = "info", duration = 5000) {
    // Remove existing mobile alerts
    const existingAlerts = document.querySelectorAll(".mobile-alert");
    existingAlerts.forEach((alert) => alert.remove());

    const alertDiv = document.createElement("div");
    alertDiv.className = `mobile-alert mobile-alert-${type}`;
    alertDiv.innerHTML = `
            <div class="mobile-alert-content">
                <span class="mobile-alert-message">${message}</span>
                <button class="mobile-alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

    // Mobile-optimized styles
    alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 10px;
            right: 10px;
            z-index: 10000;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            line-height: 1.4;
            animation: slideDown 0.3s ease-out;
            max-width: calc(100vw - 20px);
            word-wrap: break-word;
        `;

    // Type-specific colors
    if (type === "success") {
      alertDiv.style.backgroundColor = "#d5f4e6";
      alertDiv.style.color = "#1e7e34";
      alertDiv.style.border = "2px solid #27ae60";
    } else if (type === "error") {
      alertDiv.style.backgroundColor = "#fadbd8";
      alertDiv.style.color = "#721c24";
      alertDiv.style.border = "2px solid #e74c3c";
    } else if (type === "warning") {
      alertDiv.style.backgroundColor = "#fef5e7";
      alertDiv.style.color = "#856404";
      alertDiv.style.border = "2px solid #f39c12";
    } else {
      alertDiv.style.backgroundColor = "#d6eaf8";
      alertDiv.style.color = "#0c5460";
      alertDiv.style.border = "2px solid #3498db";
    }

    // Close button styles
    const closeBtn = alertDiv.querySelector(".mobile-alert-close");
    if (closeBtn) {
      closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                color: inherit;
                padding: 0;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
    }

    document.body.appendChild(alertDiv);

    // Auto-remove with longer duration for mobile
    if (duration > 0) {
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.style.animation = "slideUp 0.3s ease-in forwards";
          setTimeout(() => alertDiv.remove(), 300);
        }
      }, duration);
    }

    return alertDiv;
  }

  // Mobile viewport fix
  function fixMobileViewport() {
    // Prevent zoom on input focus (iOS)
    if (isIOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        );
      }
    }

    // Handle orientation change
    window.addEventListener("orientationchange", function () {
      setTimeout(() => {
        // Force map resize if exists
        if (window.map && window.map.invalidateSize) {
          window.map.invalidateSize();
        }

        // Scroll to top to fix viewport issues
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 100);
      }, 100);
    });
  }

  // Enhanced touch handling for mobile
  function setupMobileTouchHandling() {
    let touchStartY = 0;
    let touchStartX = 0;

    document.addEventListener(
      "touchstart",
      function (e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchmove",
      function (e) {
        // Prevent pull-to-refresh on mobile when scrolling maps
        const mapElement = e.target.closest("#map-container, .map-container");
        if (mapElement) {
          const touchY = e.touches[0].clientY;
          const touchX = e.touches[0].clientX;

          // If we're at the top and pulling down, prevent default
          if (window.pageYOffset === 0 && touchY > touchStartY) {
            e.preventDefault();
          }
        }
      },
      { passive: false },
    );

    // Prevent double-tap zoom on buttons
    document.addEventListener("touchend", function (e) {
      if (e.target.matches("button, .btn, .fab")) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  // Network connectivity monitoring
  function setupNetworkMonitoring() {
    function handleOnline() {
      showMobileAlert("Connection restored! 🌐", "success", 3000);
      // Refresh data if needed
      if (window.refreshBins && typeof window.refreshBins === "function") {
        setTimeout(window.refreshBins, 1000);
      }
    }

    function handleOffline() {
      showMobileAlert(
        "No internet connection. Some features may be limited. 📱",
        "warning",
        8000,
      );
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setTimeout(() => handleOffline(), 1000);
    }
  }

  // Mobile-specific map fixes
  function setupMobileMapFixes() {
    // Don't interfere with initial map creation, just add enhancements
    function waitForMap(callback, maxAttempts = 30) {
      let attempts = 0;
      function check() {
        if (window.map && window.map.invalidateSize) {
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(check, 1000); // Check less frequently
        } else {
          console.log(
            "Mobile fixes: Map not found after waiting, skipping map enhancements",
          );
        }
      }
      check();
    }

    // Only add enhancements after map is fully ready
    waitForMap(() => {
      console.log("📱 Adding mobile map enhancements...");

      // Fix map sizing issues on mobile
      setTimeout(() => {
        if (window.map && window.map.invalidateSize) {
          window.map.invalidateSize();
        }
      }, 2000);

      // Handle device rotation
      window.addEventListener("resize", function () {
        setTimeout(() => {
          if (window.map && window.map.invalidateSize) {
            window.map.invalidateSize();
          }
        }, 500);
      });
    });
  }

  // Initialize mobile fixes
  function initMobileFixes() {
    if (!isMobile) return;

    console.log("🔧 Initializing mobile fixes...");

    // Don't start map fixes immediately, let main app initialize first
    setTimeout(() => {
      console.log("🔧 Starting delayed mobile map fixes...");
      setupMobileMapFixes();
    }, 3000);

    // Add mobile-specific CSS
    const mobileCSS = document.createElement("style");
    mobileCSS.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100px); opacity: 0; }
            }

            .mobile-alert {
                touch-action: manipulation;
            }

            .mobile-alert-content {
                position: relative;
                padding-right: 35px;
            }

            @media screen and (max-width: 768px) {
                .btn {
                    min-height: 44px;
                    padding: 12px 20px;
                    font-size: 16px;
                }

                .form-control {
                    min-height: 44px;
                    font-size: 16px;
                }

                .map-container {
                    min-height: 300px;
                }
            }
        `;
    document.head.appendChild(mobileCSS);

    // Initialize all mobile fixes (except map fixes which are delayed)
    fixMobileViewport();
    setupMobileTouchHandling();
    setupNetworkMonitoring();

    // Override global functions with mobile versions
    if (typeof window.showAlert === "undefined") {
      window.showAlert = showMobileAlert;
    }

    // Add mobile location helper
    window.getMobileLocation = getMobileLocation;
    window.mobileFetch = mobileFetch;

    console.log("✅ Mobile fixes initialized");
  }

  // Debug function for mobile issues
  window.debugMobileIssues = function () {
    const debug = {
      isMobile: isMobile,
      isIOS: isIOS,
      isAndroid: isAndroid,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      geolocation: !!navigator.geolocation,
      online: navigator.onLine,
      errors: JSON.parse(localStorage.getItem("mobile_errors") || "[]"),
      config: window.CONFIG,
      map: !!window.map,
    };

    console.log("🔍 Mobile Debug Info:", debug);
    showMobileAlert("Debug info logged to console", "info", 3000);
    return debug;
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileFixes);
  } else {
    initMobileFixes();
  }
})();
