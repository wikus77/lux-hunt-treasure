
import React, { useEffect, useRef } from 'react';

const InteractiveGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carica lo script di Globe.GL quando il componente viene montato
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/globe.gl';
    script.async = true;
    document.body.appendChild(script);

    // Configura il globo 3D quando lo script è caricato
    script.onload = () => {
      if (!globeRef.current || !window.Globe) return;
      
      const globe = window.Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        (globeRef.current);

      // Auto-rotazione
      let currentLong = 0;
      const rotationSpeed = 0.3;
      
      (function rotateCam() {
        globe.pointOfView({
          lat: 30, 
          lng: currentLong,
          altitude: 2.5
        });
        currentLong += rotationSpeed;
        requestAnimationFrame(rotateCam);
      })();

      // Gestione del ridimensionamento
      const handleResize = () => {
        if (globeRef.current) {
          globe
            .width(globeRef.current.clientWidth)
            .height(globeRef.current.clientHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Pulizia quando il componente viene smontato
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
      // Rimuovi lo script quando il componente viene smontato
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      ref={globeRef} 
      className="w-full h-full relative bg-black"
      style={{ cursor: 'grab' }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-10 animate-pulse">
        Caricamento Globo 3D...
      </div>
    </div>
  );
};

export default InteractiveGlobe;
