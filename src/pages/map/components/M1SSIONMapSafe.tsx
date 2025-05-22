
import React, { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/mapCursor.css";

// Global array to store circles outside of React lifecycle
const drawnCircles: L.Circle[] = [];

interface M1SSIONMapSafeProps {
  selectedRadius?: number;
  className?: string;
}

const M1SSIONMapSafe: React.FC<M1SSIONMapSafeProps> = ({ 
  selectedRadius = 500,
  className = ""
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the map
    const map = L.map(containerRef.current).setView([41.9028, 12.4964], 13);
    mapRef.current = map;

    // Add the tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Set crosshair cursor
    map.getContainer().style.cursor = "crosshair";

    // Add continuous click handler that always stays active
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;

      // Create and add the circle
      const circle = L.circle([lat, lng], {
        radius: selectedRadius,
        color: "#00BFFF",
        fillColor: "#00BFFF",
        fillOpacity: 0.5,
        weight: 2
      }).addTo(map);

      // Store in global array to prevent garbage collection
      drawnCircles.push(circle);

      console.log("🧠 CERCHIO INSERITO SU CLICK REALE", lat, lng, "Total circles:", drawnCircles.length);
      
      // Optional: Add click event to circle for interaction
      circle.on('click', () => {
        console.log("Circle clicked at", circle.getLatLng());
        circle.bindPopup(`Area radius: ${selectedRadius}m`).openPopup();
      });
    });

    // Add a test circle to verify rendering works immediately
    setTimeout(() => {
      if (!mapRef.current) return;
      
      const testCircle = L.circle([41.9028, 12.4964], {
        radius: 300,
        color: "#00FF00",
        fillOpacity: 0.4
      }).addTo(mapRef.current);
      
      drawnCircles.push(testCircle);
      console.log("✅ TEST CIRCLE ADDED ON LOAD", testCircle.getLatLng());
    }, 500);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [selectedRadius]);

  return (
    <div 
      ref={containerRef} 
      className={`h-[600px] w-full rounded-lg overflow-hidden border border-projectx-deep-blue/40 ${className}`}
    />
  );
};

export default M1SSIONMapSafe;
