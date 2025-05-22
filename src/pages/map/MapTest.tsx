
import React, { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Isolated test component to verify basic Leaflet functionality
 * without any reactive state management or custom hooks
 */
const MapTest = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize the map when the component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    console.log("🧪 TEST: Initializing standalone Leaflet map");

    // Create the map instance
    mapRef.current = L.map(mapContainerRef.current).setView([41.9028, 12.4964], 13);

    // Add the OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Set crosshair cursor
    mapRef.current.getContainer().style.cursor = "crosshair";

    // Add click handler that creates a circle at the clicked location
    mapRef.current.on("click", (e) => {
      console.log("🧪 TEST: Map clicked at:", e.latlng);
      
      // Create a circle at the clicked location
      const circle = L.circle(e.latlng, {
        radius: 500,
        color: "#00BFFF",
        fillColor: "#00BFFF",
        fillOpacity: 0.4,
        weight: 2
      }).addTo(mapRef.current!);
      
      console.log("🧪 TEST: Circle created at:", e.latlng);
      
      // Add a click handler to the circle
      circle.on('click', () => {
        console.log("🧪 TEST: Circle clicked");
        
        // Show a popup when the circle is clicked
        circle.bindPopup("Test Circle<br>Radius: 500m").openPopup();
      });
    });

    // Cleanup function to remove the map when the component unmounts
    return () => {
      if (mapRef.current) {
        console.log("🧪 TEST: Cleaning up map");
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col w-full h-screen">
      <div className="p-4 absolute top-0 z-10 bg-black/80 text-white w-full">
        <h1 className="text-xl font-bold">Leaflet Test Map</h1>
        <p>Click anywhere on the map to create a circle</p>
      </div>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full" 
        style={{ cursor: 'crosshair' }}
      />
    </div>
  );
};

export default MapTest;
