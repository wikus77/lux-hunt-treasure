
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getDefaultMapSettings } from '@/utils/mapUtils';

// Fix for marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x.png',
  iconUrl: '/assets/marker-icon.png',
  shadowUrl: '/assets/marker-shadow.png',
});

const prizeIcon = new L.Icon({
  iconUrl: '/assets/prize-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom component to update the map view
function SetViewOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapLogicProvider = () => {
  const [prizeLocation, setPrizeLocation] = useState<[number, number]>([41.9027, 12.4963]); // Roma by default
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [bufferRadius, setBufferRadius] = useState(1000); // 1km
  const [mapSettings, setMapSettings] = useState(getDefaultMapSettings());
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);
  
  // In a real application, this would come from your backend
  useEffect(() => {
    // Simulated prize location near user or default to Rome
    setTimeout(() => {
      if (userLocation) {
        // Random offset within a certain range from user's location
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        setPrizeLocation([
          userLocation[0] + latOffset,
          userLocation[1] + lngOffset
        ]);
        
        // Set buffer radius based on clues unlocked (simulated)
        const unlockedClues = parseInt(localStorage.getItem('unlockedClues') || '0');
        const newRadius = Math.max(100, 2000 - unlockedClues * 200); // Shrinks as more clues are unlocked
        setBufferRadius(newRadius);
      }
    }, 1000);
  }, [userLocation]);
  
  // Define map center based on availability
  const mapCenter: [number, number] = userLocation || prizeLocation;
  
  return (
    <div style={{ height: '60vh', width: '100%', zIndex: 1 }} className="rounded-lg overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={mapSettings.attribution}
          url={mapSettings.tileUrl}
        />
        
        {/* Circle showing approximate prize location */}
        <Circle
          center={prizeLocation}
          pathOptions={{
            color: '#00D1FF',
            fillColor: '#00D1FF',
            fillOpacity: 0.2,
            weight: 2
          }}
          radius={bufferRadius}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
          </Marker>
        )}
        
        {/* Update the view when center changes */}
        <SetViewOnChange center={mapCenter} zoom={13} />
      </MapContainer>
    </div>
  );
};

export default MapLogicProvider;
