
import React from 'react';
import L from 'leaflet';

interface TechnicalStatusProps {
  mapRef?: React.MutableRefObject<L.Map | null>;
  isAddingMapPoint?: boolean;
  isAddingPoint?: boolean;
  isAddingSearchArea?: boolean;
  newPoint?: any;
  mapPoints?: any[];
  searchAreas?: any[];
}

const TechnicalStatus: React.FC<TechnicalStatusProps> = ({
  mapRef,
  isAddingMapPoint = false,
  isAddingPoint = false,
  isAddingSearchArea = false,
  newPoint,
  mapPoints = [],
  searchAreas = []
}) => {
  // This component doesn't render anything visible
  // It's just for logging technical status to the console
  
  console.log("🧪 TECHNICAL REPORT - MAP SYSTEM STATUS:", {
    mapRef: mapRef?.current ? "ACTIVE" : "NOT INITIALIZED",
    isAddingPointHook: isAddingMapPoint,
    isAddingPointLogic: isAddingPoint,
    isAddingSearchArea: isAddingSearchArea,
    newPointStatus: newPoint ? "CREATED" : "NOT CREATED",
    leafletStatus: L ? "LOADED" : "NOT LOADED",
    mapPoints: mapPoints.length,
    searchAreas: searchAreas.length,
    targetPane: mapRef?.current?.getPane('markerPane') ? "EXISTS" : "MISSING",
  });
  
  return null;
};

export default TechnicalStatus;
