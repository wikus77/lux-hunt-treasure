
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from "lucide-react";
import L from 'leaflet';

// Fix for Leaflet marker icon issue in production builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Helper component to set the view of the map
function SetMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface ClueLocation {
  lat: number;
  lng: number;
  label: string;
}

interface ClueMapProps {
  location: ClueLocation;
}

const ClueMap: React.FC<ClueMapProps> = ({ location }) => {
  useEffect(() => {
    // This is needed to properly render the map when it's mounted
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }, []);
  
  // Default center to the location provided
  const mapCenter: [number, number] = [location.lat, location.lng];
  // Default search radius in meters
  const searchRadius = 500;

  return (
    <>
      {/* Map Component */}
      <div className="h-[400px] w-full overflow-hidden rounded-lg border border-white/10">
        <MapContainer 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Custom component to set view on load */}
          <SetMapView center={mapCenter} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Circle 
            center={mapCenter}
            pathOptions={{ 
              fillColor: '#3B82F6', 
              fillOpacity: 0.2, 
              color: '#3B82F6',
              weight: 1
            }}
            radius={searchRadius}
          />
          
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="font-medium">{location.label}</div>
              <div className="text-sm text-muted-foreground">Search area for clue</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {/* Location Label */}
      <div className="flex items-center text-md text-muted-foreground">
        <MapPin className="w-4 h-4 mr-2" />
        <span>{location.label}</span>
      </div>
    </>
  );
};

export default ClueMap;
