
import { useEffect, useRef } from 'react';

// Hook to inject the globe.gl script and handle the iframe setup
const useGlobeEffect = (iframeId: string, visible: boolean) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!visible || initialized.current) return;
    
    const iframeElement = document.getElementById(iframeId) as HTMLIFrameElement;
    if (!iframeElement) return;
    
    // Create a script to inject into the iframe
    const injectGlobeScript = () => {
      try {
        const iframe = iframeElement;
        if (!iframe.contentWindow) return;
        
        const doc = iframe.contentWindow.document;
        
        // Set up basic HTML structure
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                margin: 0; 
                overflow: hidden; 
                background: #000000;
                font-family: sans-serif;
              }
              .labels {
                position: absolute;
                z-index: 1;
                color: white;
                font-size: 12px;
                pointer-events: none;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
              }
            </style>
            <script src="https://unpkg.com/globe.gl"></script>
          </head>
          <body>
            <div id="globeViz"></div>
            <script>
              // Wait for Globe to load
              window.onload = () => {
                if (!window.Globe) {
                  console.error('Globe library not loaded');
                  return;
                }
                
                // Create globe
                const globe = Globe()
                  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
                  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
                  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
                  .width(window.innerWidth)
                  .height(window.innerHeight)
                  (document.getElementById('globeViz'));
                
                // Add major European cities
                const europeanCities = [
                  { lat: 51.5074, lng: -0.1278, name: 'London' },
                  { lat: 48.8566, lng: 2.3522, name: 'Paris' },
                  { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
                  { lat: 41.9028, lng: 12.4964, name: 'Rome' },
                  { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
                  { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
                  { lat: 55.6761, lng: 12.5683, name: 'Copenhagen' },
                  { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
                  { lat: 59.9139, lng: 10.7522, name: 'Oslo' },
                  { lat: 60.1695, lng: 24.9354, name: 'Helsinki' },
                  { lat: 48.2082, lng: 16.3738, name: 'Vienna' },
                  { lat: 47.4979, lng: 19.0402, name: 'Budapest' },
                  { lat: 50.0755, lng: 14.4378, name: 'Prague' },
                  { lat: 38.7223, lng: -9.1393, name: 'Lisbon' },
                  { lat: 50.8503, lng: 4.3517, name: 'Brussels' },
                  { lat: 53.3498, lng: -6.2603, name: 'Dublin' },
                  { lat: 37.9838, lng: 23.7275, name: 'Athens' },
                  { lat: 41.0082, lng: 28.9784, name: 'Istanbul' },
                  { lat: 45.8150, lng: 15.9819, name: 'Zagreb' },
                  { lat: 44.4268, lng: 26.1025, name: 'Bucharest' },
                  { lat: 42.6977, lng: 23.3219, name: 'Sofia' },
                  { lat: 42.5063, lng: 1.5218, name: 'Andorra' },
                  { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
                  { lat: 45.4642, lng: 9.1900, name: 'Milan' },
                  { lat: 43.7696, lng: 11.2558, name: 'Florence' },
                  { lat: 40.8518, lng: 14.2681, name: 'Naples' },
                  { lat: 45.0703, lng: 7.6869, name: 'Turin' },
                  { lat: 37.5079, lng: 15.0830, name: 'Catania' }
                ];
                
                // Add points for cities
                globe.pointsData(europeanCities)
                  .pointColor(() => 'rgba(255, 255, 255, 0.8)')
                  .pointAltitude(0.01)
                  .pointRadius(0.15)
                  .pointsMerge(true)
                  .pointLabel(d => d.name)
                  .onPointClick(point => {
                    globe.pointOfView({
                      lat: point.lat,
                      lng: point.lng,
                      altitude: 1.5
                    }, 1000);
                  });
                
                // Center on Europe
                globe.pointOfView({
                  lat: 48.8566,
                  lng: 19.3522,
                  altitude: 2.5
                }, 0);
                
                // Auto-rotation
                let currentLong = 19.3522;
                const rotationSpeed = 0.1;
                let isRotating = true;
                
                (function rotateCam() {
                  if (isRotating) {
                    globe.pointOfView({
                      lat: 48.8566,
                      lng: currentLong,
                      altitude: 2.5
                    });
                    currentLong += rotationSpeed;
                  }
                  requestAnimationFrame(rotateCam);
                })();
                
                // Handle resize
                window.addEventListener('resize', () => {
                  globe
                    .width(window.innerWidth)
                    .height(window.innerHeight);
                });
                
                // Add click controls
                document.addEventListener('click', () => {
                  isRotating = !isRotating;
                });
              };
            </script>
          </body>
          </html>
        `);
        doc.close();
        
        initialized.current = true;
      } catch (error) {
        console.error("Error initializing globe:", error);
      }
    };

    // Set src to about:blank first, then inject our script
    if (iframeElement.src !== 'about:blank') {
      iframeElement.src = 'about:blank';
      iframeElement.onload = injectGlobeScript;
    } else {
      injectGlobeScript();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [iframeId, visible]);
};

export default useGlobeEffect;
