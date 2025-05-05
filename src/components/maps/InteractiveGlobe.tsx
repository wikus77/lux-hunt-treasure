
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Minus, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InteractiveGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const isRotatingRef = useRef(true);

  useEffect(() => {
    // Clean up any previous instances
    if (globeRef.current) {
      while (globeRef.current.firstChild) {
        globeRef.current.removeChild(globeRef.current.firstChild);
      }
    }
    
    // Load the Globe.gl script with error handling
    try {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/globe.gl@2.28.6/dist/globe.gl.min.js';
      script.async = true;
      script.onload = initGlobe;
      script.onerror = handleScriptError;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
        if (globeInstanceRef.current) {
          // Clean up globe instance
          globeInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error loading globe script:", error);
      setIsLoading(false);
    }
  }, []);

  const initGlobe = () => {
    if (!globeRef.current || !window.Globe) {
      console.error("Globe reference or Globe.gl library not available");
      setIsLoading(false);
      return;
    }
    
    try {
      const globe = window.Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        (globeRef.current);

      globeInstanceRef.current = globe;
      
      // Add city points for visibility
      const cities = [
        { lat: 40.7128, lng: -74.0060, name: 'New York' },
        { lat: 48.8566, lng: 2.3522, name: 'Paris' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
        { lat: 51.5074, lng: -0.1278, name: 'London' },
        { lat: 41.9028, lng: 12.4964, name: 'Rome' },
        { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
        { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' },
        { lat: 45.4642, lng: 9.1900, name: 'Milan' },
      ];
      
      globe.pointsData(cities)
        .pointColor(() => 'rgba(255, 255, 255, 0.8)')
        .pointAltitude(0.01)
        .pointRadius(0.12)
        .pointsMerge(true)
        .pointLabel(d => d.name);

      // Set up auto-rotation
      let currentLong = 0;
      const rotationSpeed = 0.3;
      
      const rotateCam = () => {
        if (isRotatingRef.current && globeInstanceRef.current) {
          try {
            globeInstanceRef.current.pointOfView({
              lat: 30,
              lng: currentLong,
              altitude: 2.5
            });
            currentLong += rotationSpeed;
            requestAnimationFrame(rotateCam);
          } catch (err) {
            console.error("Error during globe rotation:", err);
          }
        } else if (isRotatingRef.current) {
          requestAnimationFrame(rotateCam);
        }
      };
      
      // Start rotation
      rotateCam();

      // Window resize handler
      const handleResize = () => {
        if (globeRef.current && globeInstanceRef.current) {
          try {
            globeInstanceRef.current
              .width(globeRef.current.clientWidth)
              .height(globeRef.current.clientHeight);
          } catch (err) {
            console.error("Error resizing globe:", err);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      setIsLoading(false);

      return () => window.removeEventListener('resize', handleResize);
    } catch (error) {
      console.error("Error initializing globe:", error);
      setIsLoading(false);
    }
  };

  const handleScriptError = () => {
    console.error("Failed to load Globe.gl script");
    setIsLoading(false);
  };

  const handleZoom = (zoomIn: boolean) => {
    if (!globeInstanceRef.current) return;
    
    try {
      const currentAltitude = globeInstanceRef.current.pointOfView().altitude;
      const newAltitude = zoomIn ? 
        Math.max(currentAltitude * 0.7, 0.1) : 
        Math.min(currentAltitude * 1.3, 5);
      
      globeInstanceRef.current.pointOfView({ altitude: newAltitude }, 300);
    } catch (err) {
      console.error("Error handling zoom:", err);
    }
  };

  const toggleRotation = () => {
    isRotatingRef.current = !isRotatingRef.current;
    setIsRotating(!isRotating);
    
    // Restart rotation if needed
    if (isRotatingRef.current) {
      const rotateCam = () => {
        if (!isRotatingRef.current || !globeInstanceRef.current) return;
        
        try {
          const pov = globeInstanceRef.current.pointOfView();
          globeInstanceRef.current.pointOfView({
            ...pov,
            lng: pov.lng + 0.3
          });
        } catch (err) {
          console.error("Error rotating camera:", err);
        }
        
        requestAnimationFrame(rotateCam);
      };
      
      requestAnimationFrame(rotateCam);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={globeRef} 
        className="w-full h-full relative bg-black"
        style={{ cursor: 'grab' }}
      />
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoom(true)}
          className="bg-black/50 hover:bg-black/70"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleZoom(false)}
          className="bg-black/50 hover:bg-black/70"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleRotation}
          className="bg-black/50 hover:bg-black/70"
        >
          {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Caricamento Globo 3D...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGlobe;
