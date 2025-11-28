// © 2025 Joseph MULÉ – M1SSION™ – Clickable Map
// Mappa cliccabile per posizionare marker con visualizzazione marker esistenti

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ExistingMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  reward_type?: string;
}

interface SimpleClickMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  existingMarkers?: ExistingMarker[];
}

const SimpleClickMap: React.FC<SimpleClickMapProps> = ({
  initialLat = 41.9028,
  initialLng = 12.4964,
  onLocationSelect,
  existingMarkers = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const existingMarkersLayerRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const LRef = useRef<any>(null);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Import Leaflet
      const L = await import('leaflet');
      LRef.current = L;
      
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15, // ~75m altitude view
        zoomControl: true,
        attributionControl: false
      });

      // Add OpenStreetMap tiles (dark style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Create draggable marker for new position (BLUE - for new marker)
      const newMarkerIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D1FF, #0099CC);
          border: 3px solid white;
          box-shadow: 0 0 12px rgba(0,209,255,0.8);
          cursor: move;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([initialLat, initialLng], { 
        draggable: true,
        autoPan: true,
        icon: newMarkerIcon
      }).addTo(map);

      // Handle marker drag end
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
        toast.success(`📍 ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      });

      // Handle map click - move marker to click position
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(lat, lng);
        toast.success(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);

      // Force resize
      setTimeout(() => map.invalidateSize(), 100);

    } catch (err) {
      console.error('Map error:', err);
    }
  }, [initialLat, initialLng, onLocationSelect]);

  // 🗺️ Update existing markers on map
  useEffect(() => {
    if (!mapRef.current || !LRef.current || !ready) return;
    
    const L = LRef.current;
    const map = mapRef.current;
    
    // Clear existing marker layers
    existingMarkersLayerRef.current.forEach(m => {
      try { map.removeLayer(m); } catch {}
    });
    existingMarkersLayerRef.current = [];

    // Add new marker layers (GREEN - existing reward markers)
    existingMarkers.forEach(m => {
      const greenIcon = L.divIcon({
        className: 'existing-marker-icon',
        html: `<div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 0 10px rgba(16,185,129,0.7);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const leafletMarker = L.marker([m.lat, m.lng], { icon: greenIcon })
        .bindTooltip(`${m.title || 'Marker'} (${m.reward_type || 'reward'})`, {
          permanent: false,
          direction: 'top',
          className: 'marker-tooltip'
        })
        .addTo(map);
      
      existingMarkersLayerRef.current.push(leafletMarker);
    });
    
    console.log(`🗺️ Rendered ${existingMarkers.length} existing markers on admin map`);
    
  }, [existingMarkers, ready]);

  // Initialize map
  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css-admin')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-admin';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // Add custom tooltip styles
    if (!document.getElementById('marker-tooltip-style')) {
      const style = document.createElement('style');
      style.id = 'marker-tooltip-style';
      style.textContent = `
        .marker-tooltip {
          background: rgba(0,0,0,0.85) !important;
          border: 1px solid rgba(0,209,255,0.5) !important;
          color: #fff !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        .marker-tooltip::before {
          border-top-color: rgba(0,0,0,0.85) !important;
        }
      `;
      document.head.appendChild(style);
    }

    const timer = setTimeout(initMap, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        existingMarkersLayerRef.current = [];
      }
    };
  }, [initMap]);

  // Update marker position when props change
  useEffect(() => {
    if (markerRef.current && mapRef.current && ready) {
      markerRef.current.setLatLng([initialLat, initialLng]);
      mapRef.current.setView([initialLat, initialLng], mapRef.current.getZoom());
    }
  }, [initialLat, initialLng, ready]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0"
        style={{ background: '#1a1a2e', zIndex: 1 }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Caricamento...</p>
          </div>
        </div>
      )}
      {ready && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-[1000]">
          <div className="bg-black/80 px-2 py-1 rounded text-xs text-cyan-400">
            👆 Clicca per posizionare il marker
          </div>
          <div className="bg-black/80 px-2 py-1 rounded text-xs flex gap-3">
            <span className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D1FF', display: 'inline-block' }}></span>
              <span className="text-cyan-400">Nuovo</span>
            </span>
            <span className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span className="text-green-400">Esistenti ({existingMarkers.length})</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleClickMap;
