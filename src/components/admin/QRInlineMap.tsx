import React, { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getDefaultMapSettings } from '@/utils/mapUtils';

interface QRInlineMapProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

const ClickHandler: React.FC<{ onChange: (lat: number, lng: number) => void }> = ({ onChange }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const QRInlineMap: React.FC<QRInlineMapProps> = ({ lat, lng, onChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const center = useMemo<[number, number]>(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      return [lat, lng];
    }
    return [46.0, 8.0]; // Vista europea generica
  }, [lat, lng]);

  const { tileUrl, attribution } = getDefaultMapSettings();

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ 
          height: 320, 
          width: '100%',
          background: 'transparent',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
        zoomAnimationThreshold={4}
        preferCanvas={false}
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
          }
        }}
      >
        <TileLayer 
          url={tileUrl} 
          attribution={attribution}
          maxZoom={18}
          minZoom={3}
          keepBuffer={12}
          updateWhenIdle={true}
          updateWhenZooming={false}
          crossOrigin="anonymous"
          detectRetina={true}
          tileSize={256}
          zoomOffset={0}
          bounds={[[-90, -180], [90, 180]]}
          noWrap={false}
          subdomains={['a', 'b', 'c']}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
        <ClickHandler onChange={onChange} />
        {typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng) && (
          <Marker
            position={[lat, lng]}
            draggable
            icon={markerIcon}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const p = m.getLatLng();
                onChange(p.lat, p.lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default QRInlineMap;
