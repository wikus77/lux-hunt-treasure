
import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus, Minus, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

const SearchableGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isRotatingRef = useRef(true);
  const citiesRef = useRef<{lat: number, lng: number, name: string}[]>([]);

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
      setIsLoading(false);

      // Add city points (for visibility at high zoom)
      const cities = [
        { lat: 40.7128, lng: -74.0060, name: 'New York' },
        { lat: 48.8566, lng: 2.3522, name: 'Paris' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
        { lat: 51.5074, lng: -0.1278, name: 'London' },
        { lat: 41.9028, lng: 12.4964, name: 'Rome' },
        { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
        { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' },
        { lat: 19.4326, lng: -99.1332, name: 'Mexico City' },
        { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
        { lat: 45.4642, lng: 9.1900, name: 'Milan' },
        { lat: 43.7696, lng: 11.2558, name: 'Florence' },
        { lat: 40.8518, lng: 14.2681, name: 'Naples' },
        { lat: 45.0703, lng: 7.6869, name: 'Turin' },
        { lat: 43.7228, lng: 10.4017, name: 'Pisa' },
        { lat: 44.4056, lng: 8.9463, name: 'Genoa' },
        { lat: 45.6495, lng: 13.7768, name: 'Trieste' },
        { lat: 45.4408, lng: 12.3155, name: 'Venice' },
        { lat: 41.1171, lng: 16.8719, name: 'Bari' },
        { lat: 37.5079, lng: 15.0830, name: 'Catania' },
        { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
        { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
        { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
        { lat: 48.2082, lng: 16.3738, name: 'Vienna' },
        { lat: 50.0755, lng: 14.4378, name: 'Prague' },
        { lat: 47.4979, lng: 19.0402, name: 'Budapest' },
        { lat: 38.7223, lng: -9.1393, name: 'Lisbon' },
        { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
        { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
        { lat: 39.4699, lng: -0.3763, name: 'Valencia' }
      ];
      
      citiesRef.current = cities;
      
      globe.pointsData(cities)
        .pointColor(() => 'rgba(255, 255, 255, 0.8)')
        .pointAltitude(0.01)
        .pointRadius(0.12)
        .pointsMerge(true)
        .pointLabel(d => d.name)
        .onPointClick(point => {
          isRotatingRef.current = false;
          setIsRotating(false);
          globe.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 0.1
          }, 1000);
        });

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
      Math.max(currentAltitude * 0.7, 0.1) : // Allow zooming in much closer for city-level detail
      Math.min(currentAltitude * 1.3, 5);
    
    globeInstanceRef.current.pointOfView({ altitude: newAltitude }, 300);
  };

  const toggleRotation = () => {
    isRotatingRef.current = !isRotatingRef.current;
    setIsRotating(!isRotating);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !globeInstanceRef.current) return;
    
    const query = searchQuery.toLowerCase().trim();
    const foundCity = citiesRef.current.find(city => 
      city.name.toLowerCase().includes(query)
    );
    
    if (foundCity) {
      isRotatingRef.current = false;
      setIsRotating(false);
      
      globeInstanceRef.current.pointOfView({
        lat: foundCity.lat,
        lng: foundCity.lng,
        altitude: 0.1
      }, 1000);
      
      toast.success(`Trovato: ${foundCity.name}`, {
        position: "bottom-center",
        duration: 2000
      });
    } else {
      toast.error(`Nessuna città trovata per: ${searchQuery}`, {
        position: "bottom-center",
        duration: 2000
      });
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
      <div className="absolute bottom-4 left-4 right-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca una città..."
            className="bg-black/70 border-projectx-deep-blue"
          />
          <Button 
            type="submit" 
            variant="outline"
            className="bg-projectx-deep-blue hover:bg-projectx-blue"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 z-10 animate-pulse">
          Caricamento Globo 3D...
        </div>
      )}
    </div>
  );
};

export default SearchableGlobe;
