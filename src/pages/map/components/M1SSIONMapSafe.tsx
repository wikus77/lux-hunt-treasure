
import React, { useRef, useEffect, useState } from "react";
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
  const [circleCount, setCircleCount] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("🔄 Initializing map...");
    
    // Initialize the map
    const map = L.map(containerRef.current, {
      preferCanvas: true  // Use Canvas renderer for better performance
    }).setView([41.9028, 12.4964], 13);
    
    mapRef.current = map;

    // Add the tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Set crosshair cursor with HTML class
    map.getContainer().classList.add("crosshair-cursor-enabled");

    // Add continuous click handler that always stays active
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;

      // Create and add the circle with unique styling
      const circle = L.circle([lat, lng], {
        radius: selectedRadius,
        color: "#00BFFF",
        fillColor: "#00BFFF",
        fillOpacity: 0.5,
        weight: 2
      }).addTo(map);

      // Store in global array to prevent garbage collection
      drawnCircles.push(circle);
      
      // Update state to trigger re-render for UI update only
      setCircleCount(prev => prev + 1);

      console.log(`🧠 CERCHIO #${drawnCircles.length} INSERITO SU CLICK`, lat.toFixed(4), lng.toFixed(4));
      
      // Add click event to circle for interaction
      circle.on('click', (event) => {
        // Stop propagation to prevent creating a new circle when clicking an existing one
        L.DomEvent.stopPropagation(event);
        
        console.log("⭕ Circle clicked at", circle.getLatLng());
        circle.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">Area #${drawnCircles.indexOf(circle) + 1}</h3>
            <p>Coordinate: ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
            <p>Radius: ${selectedRadius}m</p>
          </div>
        `).openPopup();
      });
    });

    // Add a test circle to verify rendering works immediately
    setTimeout(() => {
      if (!mapRef.current) return;
      
      const testCircle = L.circle([41.9028, 12.4964], {
        radius: 300,
        color: "#FF5500",  // Orange color for the test circle
        fillColor: "#FF5500",
        fillOpacity: 0.4,
        weight: 3
      }).addTo(mapRef.current);
      
      drawnCircles.push(testCircle);
      setCircleCount(prev => prev + 1);
      
      console.log("✅ TEST CIRCLE ADDED ON LOAD", testCircle.getLatLng());
      
      // Make test circle interactive too
      testCircle.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        testCircle.bindPopup("<b>Test Circle</b><br>This is the initial test circle.").openPopup();
      });
    }, 500);

    // Cleanup function - ONLY remove the map instance, NOT the circles
    return () => {
      if (mapRef.current) {
        console.log("🚫 Map cleanup - KEEPING CIRCLES", drawnCircles.length);
        mapRef.current.remove();
      }
    };
  }, [selectedRadius]);

  return (
    <div className="flex flex-col w-full h-full">
      <div 
        ref={containerRef} 
        className={`flex-1 rounded-lg overflow-hidden border-2 border-projectx-deep-blue/40 ${className}`}
      />
      <div className="mt-2 text-sm text-blue-300">
        Circles created: {circleCount} | Global array size: {drawnCircles.length}
      </div>
    </div>
  );
};

export default M1SSIONMapSafe;
