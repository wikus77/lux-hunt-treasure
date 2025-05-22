
import React, { useEffect, useRef } from 'react';
import { SearchArea } from '@/components/maps/types';
import L from 'leaflet';

type SearchAreaMapLayerProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
};

const SearchAreaMapLayer: React.FC<SearchAreaMapLayerProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  mapRef
}) => {
  console.log("AREAS STATE:", searchAreas);
  const circlesRef = useRef<{[id: string]: L.Circle}>({});
  const popupsRef = useRef<{[id: string]: L.Popup}>({});
  const areaLayerGroup = useRef<L.LayerGroup | null>(null);
  
  // Initialize the layer group
  useEffect(() => {
    if (mapRef.current && !areaLayerGroup.current) {
      areaLayerGroup.current = L.layerGroup().addTo(mapRef.current);
      console.log("Created persistent layer group for areas");
    }
  }, [mapRef.current]);
  
  // RESET APPROACH: Direct rendering using native Leaflet API
  useEffect(() => {
    console.log("🎯 DIRECT LEAFLET RENDERING:", searchAreas.length);
    const currentMap = mapRef.current;
    
    if (!currentMap) {
      console.warn("MAP REF NON DISPONIBILE PER IL DISEGNO");
      return;
    }
    
    // Clear and update layer group
    if (areaLayerGroup.current) {
      areaLayerGroup.current.clearLayers();
      console.log("Cleared existing layers in layer group");
      
      // Add new circles directly to the layer group
      searchAreas.forEach(area => {
        console.log("Creating circle for area:", area.id, "at", area.lat, area.lng);
        
        try {
          // Create circle using direct Leaflet API
          const circle = L.circle([area.lat, area.lng], {
            radius: area.radius,
            color: area.isAI ? '#9b87f5' : '#00D1FF',
            fillColor: area.isAI ? '#7E69AB' : '#00D1FF',
            fillOpacity: 0.2,
            weight: 2
          });
          
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-1';
          
          const titleElement = document.createElement('div');
          titleElement.className = 'font-medium mb-2';
          titleElement.textContent = area.label || "Area di interesse";
          popupContent.appendChild(titleElement);
          
          const radiusElement = document.createElement('div');
          radiusElement.className = 'text-sm mb-3';
          radiusElement.textContent = `Raggio: ${(area.radius/1000).toFixed(2)} km`;
          popupContent.appendChild(radiusElement);
          
          const buttonsContainer = document.createElement('div');
          buttonsContainer.className = 'flex gap-2';
          
          // Edit button
          const editButton = document.createElement('button');
          editButton.className = 'bg-gray-200 hover:bg-gray-300 text-xs flex items-center gap-1 flex-1 px-2 py-1 rounded';
          editButton.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Modifica';
          editButton.onclick = () => setActiveSearchArea(area.id);
          buttonsContainer.appendChild(editButton);
          
          // Delete button
          const deleteButton = document.createElement('button');
          deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white text-xs flex items-center gap-1 flex-1 px-2 py-1 rounded';
          deleteButton.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Elimina';
          deleteButton.onclick = () => deleteSearchArea(area.id);
          buttonsContainer.appendChild(deleteButton);
          
          popupContent.appendChild(buttonsContainer);
          
          // Create popup
          const popup = L.popup().setContent(popupContent);
          
          // Add circle to layer group
          circle.addTo(areaLayerGroup.current!);
          
          // Add click event
          circle.on('click', () => {
            setActiveSearchArea(area.id);
            circle.bindPopup(popup).openPopup();
          });
          
          // Store references
          circlesRef.current[area.id] = circle;
          popupsRef.current[area.id] = popup;
          
          console.log("✅ CERCHIO AGGIUNTO AL LAYER GROUP:", area.lat, area.lng);
        } catch (error) {
          console.error("Error creating circle:", error);
        }
      });
      
      console.log("✅ DIRECT RENDERING COMPLETE - Total areas:", searchAreas.length);
    } else {
      console.error("Layer group not initialized!");
    }
  }, [searchAreas, mapRef.current, setActiveSearchArea, deleteSearchArea]);
  
  return null;
};

export default SearchAreaMapLayer;
