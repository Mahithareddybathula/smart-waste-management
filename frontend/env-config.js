// Environment Configuration for Smart Waste Management System
// This file handles API URL configuration for different deployment environments

(function () {
  "use strict";

  // Default configuration
  const defaultConfig = {
    API_BASE_URL: "http://localhost:5000/api",
    ENVIRONMENT: "development",
  };

  // Production configuration
  const productionConfig = {
    API_BASE_URL:
      "https://smart-waste-management-production.up.railway.app/api",
    ENVIRONMENT: "production",
  };

  // Staging configuration
  const stagingConfig = {
    API_BASE_URL: "https://your-staging-api.com/api",
    ENVIRONMENT: "staging",
  };

  /**
   * Detect current environment
   */
  function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Check for localhost/development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development";
    }

    // Check for Netlify deployment
    if (
      hostname.includes(".netlify.app") ||
      hostname.includes(".netlify.com")
    ) {
      return "production";
    }

    // Check for staging environment
    if (hostname.includes("staging") || hostname.includes("dev")) {
      return "staging";
    }

    // Default to production for custom domains
    return "production";
  }

  /**
   * Get configuration based on environment
   */
  function getConfig() {
    const environment = detectEnvironment();

    switch (environment) {
      case "development":
        return { ...defaultConfig };
      case "staging":
        return { ...stagingConfig };
      case "production":
      default:
        return { ...productionConfig };
    }
  }

  /**
   * Override configuration with environment variables
   * This allows for runtime configuration through meta tags or global variables
   */
  function applyEnvironmentOverrides(config) {
    // Check for meta tag configuration
    const apiUrlMeta = document.querySelector('meta[name="api-base-url"]');
    if (apiUrlMeta && apiUrlMeta.content) {
      config.API_BASE_URL = apiUrlMeta.content;
    }

    // Check for global window configuration
    if (window.ENV_CONFIG && window.ENV_CONFIG.API_BASE_URL) {
      config.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
    }

    // Check for Netlify environment variables (if available in client)
    if (window.netlifyEnv && window.netlifyEnv.API_BASE_URL) {
      config.API_BASE_URL = window.netlifyEnv.API_BASE_URL;
    }

    return config;
  }

  /**
   * Initialize and expose configuration
   */
  function initializeConfig() {
    let config = getConfig();
    config = applyEnvironmentOverrides(config);

    // Make configuration available globally
    window.ENV_CONFIG = config;
    window.API_BASE_URL = config.API_BASE_URL;

    // Log current configuration (only in development)
    if (config.ENVIRONMENT === "development") {
      console.log("🔧 Environment Configuration:", config);
    }

    return config;
  }

  /**
   * Utility function to build API endpoint URLs
   */
  window.buildApiUrl = function (endpoint) {
    const config = window.ENV_CONFIG || getConfig();
    const baseUrl = config.API_BASE_URL.replace(/\/$/, ""); // Remove trailing slash
    const cleanEndpoint = endpoint.replace(/^\//, ""); // Remove leading slash

    return `${baseUrl}/${cleanEndpoint}`;
  };

  /**
   * Utility function to check if we're in development mode
   */
  window.isDevelopment = function () {
    const config = window.ENV_CONFIG || getConfig();
    return config.ENVIRONMENT === "development";
  };

  /**
   * Health check function for API connectivity
   */
  window.checkApiHealth = async function () {
    const config = window.ENV_CONFIG || getConfig();

    try {
      const healthEndpoint =
        config.ENVIRONMENT === "production"
          ? "/.netlify/functions/health"
          : `${config.API_BASE_URL}/health`;

      const response = await fetch(healthEndpoint);

      if (response.ok) {
        console.log("✅ API health check passed");
        return true;
      } else {
        console.warn("⚠️ API health check failed:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ API health check error:", error);
      return false;
    }
  };

  // Initialize configuration when the script loads
  document.addEventListener("DOMContentLoaded", function () {
    initializeConfig();

    // Optional: Run health check in development
    if (window.isDevelopment()) {
      setTimeout(window.checkApiHealth, 1000);
    }
  });

  // Initialize immediately if DOM is already loaded
  if (document.readyState === "loading") {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener("DOMContentLoaded", initializeConfig);
  } else {
    // DOM is already loaded
    initializeConfig();
  }
})();

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    buildApiUrl: window.buildApiUrl,
    isDevelopment: window.isDevelopment,
    checkApiHealth: window.checkApiHealth,
  };
}
