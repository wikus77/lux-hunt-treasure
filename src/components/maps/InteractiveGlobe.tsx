
import React, { useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InteractiveGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const isRotatingRef = useRef(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/globe.gl';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!globeRef.current || !window.Globe) return;
      
      const globe = window.Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        (globeRef.current);

      globeInstanceRef.current = globe;

      // Auto-rotation
      let currentLong = 0;
      const rotationSpeed = 0.3;
      
      (function rotateCam() {
        if (isRotatingRef.current) {
          globe.pointOfView({
            lat: 30,
            lng: currentLong,
            altitude: 2.5
          });
          currentLong += rotationSpeed;
        }
        requestAnimationFrame(rotateCam);
      })();

      // Handle resize
      const handleResize = () => {
        if (globeRef.current) {
          globe
            .width(globeRef.current.clientWidth)
            .height(globeRef.current.clientHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (globeRef.current) {
          while (globeRef.current.firstChild) {
            globeRef.current.removeChild(globeRef.current.firstChild);
          }
        }
      };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleZoom = (zoomIn: boolean) => {
    if (!globeInstanceRef.current) return;
    
    const currentAltitude = globeInstanceRef.current.pointOfView().altitude;
    const newAltitude = zoomIn ? 
      Math.max(currentAltitude * 0.7, 1.5) : 
      Math.min(currentAltitude * 1.3, 4);
    
    globeInstanceRef.current.pointOfView({ altitude: newAltitude });
  };

  const toggleRotation = () => {
    isRotatingRef.current = !isRotatingRef.current;
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={globeRef} 
        className="w-full h-full relative bg-black"
        onClick={toggleRotation}
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
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-10 animate-pulse">
        Caricamento Globo 3D...
      </div>
    </div>
  );
};

export default InteractiveGlobe;
