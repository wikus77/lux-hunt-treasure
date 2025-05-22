
import React, { createContext, useContext, useRef, useState } from 'react';
import L from 'leaflet';

type MapContextType = {
  mapRef: React.MutableRefObject<L.Map | null>;
  setMap: (map: L.Map) => void;
};

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<L.Map | null>(null);
  
  const setMap = (map: L.Map) => {
    console.log("Map instance set in context");
    mapRef.current = map;
  };
  
  return (
    <MapContext.Provider value={{ mapRef, setMap }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};
