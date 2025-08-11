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
  const center = useMemo<[number, number]>(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      return [lat, lng];
    }
    return [45.4642, 9.19]; // Milano
  }, [lat, lng]);

  const { tileUrl, attribution } = getDefaultMapSettings();

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MapContainer center={center} zoom={12} style={{ height: 320, width: '100%' }}>
        <TileLayer url={tileUrl} attribution={attribution} />
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
