
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { generateSearchArea } from "./hooks/useAreaGeneration";
import { useAreaOperations } from "./hooks/useAreaOperations";
import { v4 as uuidv4 } from "uuid";

export function useSearchAreasLogic(defaultLocation: [number, number]) {
  const { unlockedClues } = useBuzzClues();
  const { notifications } = useNotifications();
  const areaOperations = useAreaOperations();
  
  // Add a ref to store the radius temporarily while user selects map location
  const pendingRadiusRef = useRef<number>(500);
  const isProcessingClickRef = useRef(false);

  // When search areas change, sync with localStorage
  useEffect(() => {
    console.log("useSearchAreasLogic - searchAreas updated:", areaOperations.searchAreas);
  }, [areaOperations.searchAreas]);

  // Log the isAddingSearchArea state changes
  useEffect(() => {
    console.log("useSearchAreasLogic - isAddingSearchArea:", areaOperations.isAddingSearchArea);
    if (!areaOperations.isAddingSearchArea) {
      console.warn("FLAG isAddingSearchArea NON ATTIVO");
    }
  }, [areaOperations.isAddingSearchArea]);

  const handleAddArea = (radius?: number) => {
    // Set the radius if provided
    if (radius) {
      pendingRadiusRef.current = radius;
      console.log("Setting pending radius to:", radius);
    }

    // CRITICAL: Force setting isAddingSearchArea to true
    areaOperations.setIsAddingSearchArea(true);
    // Use startAddingArea function which handles the state update correctly
    areaOperations.startAddingArea();
    
    console.log("ATTIVATA MODALITÀ AGGIUNTA AREA");
    console.log("Modalità aggiunta area attivata, cursore cambiato in crosshair");
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: `L'area sarà creata con il raggio di ${pendingRadiusRef.current} metri`
    });
  };

  // Updated to accept Leaflet event with debouncing
  const handleMapClickArea = (e: { latlng: { lat: number; lng: number } }) => {
    console.log("Map click event received:", e);
    console.log("isAddingSearchArea state:", areaOperations.isAddingSearchArea);

    // Prevent duplicate processing
    if (isProcessingClickRef.current) {
      console.log("Already processing a click, ignoring");
      return null;
    }

    if (areaOperations.isAddingSearchArea && e.latlng) {
      try {
        isProcessingClickRef.current = true;
        
        // Extract coordinates from the event
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const radius = pendingRadiusRef.current;
        
        console.log("Coordinate selezionate:", lat, lng);
        console.log("Raggio utilizzato:", radius);
        
        // Create a new area with the given coordinates and radius
        const newAreaId = uuidv4();
        const newArea: SearchArea = {
          id: newAreaId,
          lat,
          lng,
          radius,
          label: "Area di ricerca",
          color: "#00D1FF",
          position: { lat, lng }
        };
        
        console.log("Area creata:", newArea);
        
        // Add the area to the areas state
        areaOperations.setSearchAreas(prevAreas => {
          const newAreas = [...prevAreas, newArea];
          console.log("Nuovo stato aree:", newAreas);
          return newAreas;
        });
        
        // Set the newly created area as active
        areaOperations.setActiveSearchArea(newAreaId);
        
        // Reset adding state
        areaOperations.setIsAddingSearchArea(false);
        console.log("Modalità aggiunta area disattivata, cursore ripristinato");
        
        toast.success("Area di ricerca aggiunta alla mappa");
        
        // Reset processing flag after a delay
        setTimeout(() => {
          isProcessingClickRef.current = false;
        }, 500);
        
        return newAreaId;
      } catch (error) {
        console.error("Error adding search area:", error);
        areaOperations.setIsAddingSearchArea(false);
        toast.error("Si è verificato un errore nell'aggiunta dell'area");
        
        // Reset processing flag
        isProcessingClickRef.current = false;
        return null;
      }
    } else {
      console.log("Not in adding search area mode or latLng is missing");
      return null;
    }
  };

  // Generate area from clue with dynamic radius
  const generateSearchAreaFromClues = (radius?: number) => {
    const result = generateSearchArea(defaultLocation, notifications, radius);
    
    if (result) {
      const { areaId, area } = result;
      
      // Add the area to the list
      areaOperations.addSearchArea(area);
      areaOperations.setActiveSearchArea(areaId);
      
      return areaId;
    }
    
    return null;
  };
  
  // Export everything needed
  return {
    ...areaOperations,
    handleAddArea,
    handleMapClickArea,
    generateSearchArea: generateSearchAreaFromClues,
    // Export a method to set the pending radius
    setPendingRadius: (radius: number) => {
      pendingRadiusRef.current = radius;
    }
  };
}
