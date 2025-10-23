// Debug utility for Smart Waste Management System Map Issues
// Load this script to diagnose and fix map loading problems

(function() {
    'use strict';

    console.log('🔧 Map Debug Utility Loaded');

    // Create debug panel
    function createDebugPanel() {
        if (document.getElementById('debug-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            font-family: monospace;
            font-size: 12px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🐛 Map Debug Panel</strong>
                <button onclick="document.getElementById('debug-panel').remove()"
                        style="background: #e74c3c; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">✕</button>
            </div>
            <div id="debug-content">Initializing...</div>
            <div style="margin-top: 10px;">
                <button onclick="window.debugMap.runFullDiagnostic()"
                        style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
                    🔍 Full Diagnostic
                </button>
                <button onclick="window.debugMap.fixMap()"
                        style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
                    🔧 Fix Map
                </button>
                <button onclick="window.debugMap.clearMap()"
                        style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">
                    🧹 Clear Map
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    // Main debug object
    window.debugMap = {

        // Run comprehensive diagnostic
        runFullDiagnostic: function() {
            const results = [];

            // Check Leaflet
            results.push({
                test: 'Leaflet Library',
                status: typeof L !== 'undefined' ? '✅ PASS' : '❌ FAIL',
                details: typeof L !== 'undefined' ? 'Leaflet loaded' : 'Leaflet not found'
            });

            // Check map container
            const container = document.getElementById('map-container');
            results.push({
                test: 'Map Container',
                status: container ? '✅ PASS' : '❌ FAIL',
                details: container ?
                    `Found: ${container.offsetWidth}x${container.offsetHeight}px` :
                    'Container not found'
            });

            // Check window.map
            results.push({
                test: 'Global Map Instance',
                status: window.map ? '✅ PASS' : '❌ FAIL',
                details: window.map ?
                    `Center: ${window.map.getCenter ? window.map.getCenter() : 'No getCenter method'}` :
                    'window.map not set'
            });

            // Check CONFIG
            results.push({
                test: 'Configuration',
                status: typeof CONFIG !== 'undefined' ? '✅ PASS' : '❌ FAIL',
                details: typeof CONFIG !== 'undefined' ?
                    `API: ${CONFIG.API_BASE_URL}, Center: ${CONFIG.MAP_DEFAULT_CENTER.lat}, ${CONFIG.MAP_DEFAULT_CENTER.lng}` :
                    'CONFIG not found'
            });

            // Check geolocation
            results.push({
                test: 'Geolocation Support',
                status: navigator.geolocation ? '✅ PASS' : '❌ FAIL',
                details: navigator.geolocation ? 'Available' : 'Not supported'
            });

            // Check current page
            const isMapPage = window.location.pathname.includes('find.html');
            results.push({
                test: 'Current Page',
                status: isMapPage ? '✅ PASS' : '⚠️ WARN',
                details: `Path: ${window.location.pathname} ${isMapPage ? '(Map page)' : '(Not map page)'}`
            });

            // Display results
            this.displayDiagnostic(results);
        },

        // Display diagnostic results
        displayDiagnostic: function(results) {
            const panel = createDebugPanel();
            const content = document.getElementById('debug-content');

            let html = '<div style="margin-bottom: 10px;"><strong>Diagnostic Results:</strong></div>';

            results.forEach(result => {
                html += `
                    <div style="margin: 5px 0; padding: 5px; background: ${result.status.includes('✅') ? '#2d5a2d' : result.status.includes('❌') ? '#5a2d2d' : '#5a4a2d'}; border-radius: 3px;">
                        <div><strong>${result.test}</strong>: ${result.status}</div>
                        <div style="font-size: 10px; opacity: 0.8;">${result.details}</div>
                    </div>
                `;
            });

            content.innerHTML = html;
        },

        // Attempt to fix map
        fixMap: function() {
            console.log('🔧 Attempting to fix map...');

            const container = document.getElementById('map-container');
            if (!container) {
                console.error('❌ No map container found');
                return;
            }

            // Clear existing content
            container.innerHTML = '';

            // Check Leaflet
            if (typeof L === 'undefined') {
                console.error('❌ Leaflet not available');
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #e74c3c;">
                        <p>Leaflet library not loaded</p>
                        <button onclick="location.reload()">Refresh Page</button>
                    </div>
                `;
                return;
            }

            // Create map
            try {
                const defaultCenter = [16.3164, 80.4248]; // Vijayawada, India
                const defaultZoom = 13;

                console.log('🗺️ Creating new map instance...');

                const newMap = L.map('map-container', {
                    center: defaultCenter,
                    zoom: defaultZoom,
                    zoomControl: true,
                    attributionControl: true
                });

                // Add tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(newMap);

                // Set global references
                window.map = newMap;
                if (typeof map !== 'undefined') {
                    map = newMap;
                }

                console.log('✅ Map created successfully');

                // Force resize
                setTimeout(() => {
                    newMap.invalidateSize();
                    console.log('✅ Map resized');
                }, 100);

                // Add success message
                setTimeout(() => {
                    if (typeof showAlert === 'function') {
                        showAlert('Map fixed successfully!', 'success');
                    }
                }, 500);

                this.runFullDiagnostic();

            } catch (error) {
                console.error('❌ Map fix failed:', error);
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #e74c3c;">
                        <p>Map fix failed: ${error.message}</p>
                        <button onclick="location.reload()">Refresh Page</button>
                    </div>
                `;
            }
        },

        // Clear map and reset
        clearMap: function() {
            console.log('🧹 Clearing map...');

            if (window.map && typeof window.map.remove === 'function') {
                window.map.remove();
                console.log('✅ Existing map removed');
            }

            window.map = null;

            const container = document.getElementById('map-container');
            if (container) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: #f8f9fa; border-radius: 8px;">
                        <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;"></i>
                        <p>Map cleared. Ready for reinitialization.</p>
                        <button onclick="window.debugMap.fixMap()" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            🔧 Reinitialize Map
                        </button>
                    </div>
                `;
            }

            this.runFullDiagnostic();
        },

        // Monitor map status
        startMonitoring: function() {
            let checkCount = 0;
            const maxChecks = 30;

            const monitor = setInterval(() => {
                checkCount++;

                if (window.map && typeof window.map.getCenter === 'function') {
                    console.log(`✅ Map monitoring: Ready after ${checkCount} checks`);
                    clearInterval(monitor);
                } else if (checkCount >= maxChecks) {
                    console.log(`⚠️ Map monitoring: Not ready after ${maxChecks} checks`);
                    clearInterval(monitor);
                    this.runFullDiagnostic();
                }
            }, 500);
        },

        // Get map info
        getMapInfo: function() {
            if (!window.map) {
                return { error: 'No map instance' };
            }

            return {
                center: window.map.getCenter ? window.map.getCenter() : 'N/A',
                zoom: window.map.getZoom ? window.map.getZoom() : 'N/A',
                container: window.map.getContainer ? 'Available' : 'N/A',
                size: window.map.getSize ? window.map.getSize() : 'N/A'
            };
        },

        // Show debug panel
        show: function() {
            createDebugPanel();
            this.runFullDiagnostic();
        }
    };

    // Auto-start monitoring on map pages
    if (window.location.pathname.includes('find.html')) {
        console.log('🐛 Auto-starting map monitoring for find page');

        // Wait a bit for page to load
        setTimeout(() => {
            window.debugMap.startMonitoring();
        }, 1000);

        // Auto-show debug panel in development
        if (window.location.hostname.includes('localhost') ||
            window.location.hostname.includes('netlify') ||
            window.location.search.includes('debug=true')) {

            setTimeout(() => {
                window.debugMap.show();
            }, 2000);
        }
    }

    // Expose global debug function
    window.showMapDebug = function() {
        window.debugMap.show();
    };

    console.log('🔧 Debug utility ready. Use window.debugMap or window.showMapDebug()');

})();
