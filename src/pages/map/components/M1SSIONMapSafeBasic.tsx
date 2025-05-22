
import React, { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const M1SSIONMapSafe = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("🔄 Initializing isolated map...");
    
    const map = L.map(containerRef.current).setView([41.9028, 12.4964], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.getContainer().style.cursor = "crosshair";

    // Global array to store circles outside of React lifecycle
    const drawnCircles: L.Circle[] = [];

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const circle = L.circle([lat, lng], {
        radius: 500,
        color: "#FF00FF",
        fillOpacity: 0.6
      }).addTo(map);
      
      // Store in array to prevent garbage collection
      drawnCircles.push(circle);
      
      console.log("✅ CERCHIO ATTIVO INSERITO", lat.toFixed(4), lng.toFixed(4));
      console.log("🔢 Totale cerchi attivi:", drawnCircles.length);
    });

    // Add a test circle to verify rendering works immediately
    setTimeout(() => {
      if (!mapRef.current) return;
      
      const testCircle = L.circle([41.9028, 12.4964], {
        radius: 800,
        color: "#00FF00",
        fillOpacity: 0.6
      }).addTo(mapRef.current);
      
      drawnCircles.push(testCircle);
      console.log("✅ TEST: CERCHIO STATICO INSERITO", 41.9028, 12.4964);
    }, 1000);

    return () => {
      console.log("🚫 Map cleanup - KEEPING CIRCLES", drawnCircles.length);
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100vh", width: "100vw" }} />;
};

export default M1SSIONMapSafe;
