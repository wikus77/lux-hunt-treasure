
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { SearchArea } from '@/components/maps/types';

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
  const map = useMap();
  
  // Store map reference
  useEffect(() => {
    if (map) {
      mapRef.current = map;
      console.log("Map reference set in SearchAreaMapLayer");
    }
  }, [map, mapRef]);
  
  // Draw search areas when they change
  useEffect(() => {
    if (!map) return;
    
    console.log("Drawing search areas on map:", searchAreas);
    
    // Create a map of existing circles by ID
    const circleLayerGroup = L.layerGroup().addTo(map);
    
    searchAreas.forEach(area => {
      console.log("Creating circle for area:", area);
      const circle = L.circle([area.lat, area.lng], {
        radius: area.radius,
        color: area.color || '#00D1FF',
        fillColor: area.color || '#00D1FF',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(circleLayerGroup);
      
      // Add click handler to select the area
      circle.on('click', () => {
        console.log("Circle clicked:", area.id);
        setActiveSearchArea(area.id);
      });
      
      // Add popup with area info
      circle.bindPopup(`
        <div>
          <h3>${area.label || 'Area di ricerca'}</h3>
          <p>Raggio: ${area.radius}m</p>
          <button class="delete-area" data-id="${area.id}">Elimina</button>
        </div>
      `);
      
      // Handle popup open to attach event listener to delete button
      circle.on('popupopen', () => {
        setTimeout(() => {
          const deleteButton = document.querySelector(`.delete-area[data-id="${area.id}"]`);
          if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
              e.preventDefault();
              deleteSearchArea(area.id);
              map.closePopup();
            });
          }
        }, 0);
      });
    });
    
    // Cleanup function to remove all circles
    return () => {
      map.removeLayer(circleLayerGroup);
    };
  }, [map, searchAreas, setActiveSearchArea, deleteSearchArea]);
  
  return null;
};

export default SearchAreaMapLayer;
