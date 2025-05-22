
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import { clues } from "@/data/cluesData";

/**
 * Generates a search area based on clues and position data
 */
export const generateSearchArea = (
  defaultLocation: [number, number],
  notifications: any[] | null,
  radius?: number
): { areaId: string; area: SearchArea } | null => {
  try {
    // Utilizza l'analizzatore di indizi per determinare la posizione
    const locationInfo = analyzeCluesForLocation(clues, notifications || []);
    
    let targetLat = defaultLocation[0];
    let targetLng = defaultLocation[1];
    let label = "Area generata";
    let confidenceValue: string = "Media"; 
    
    if (locationInfo.lat && locationInfo.lng) {
      targetLat = locationInfo.lat;
      targetLng = locationInfo.lng;
      label = locationInfo.description || "Area basata su indizi";
      
      // Converti la confidenza in italiano
      if (locationInfo.confidence === "alta") confidenceValue = "Alta";
      else if (locationInfo.confidence === "media") confidenceValue = "Media";
      else confidenceValue = "Bassa";
    }

    // Usa il raggio fornito o il valore di default di 500km
    const finalRadius = radius || 500000;

    // Crea l'area di ricerca con stile viola neon
    const newArea: SearchArea = {
      id: uuidv4(),
      lat: targetLat,
      lng: targetLng,
      radius: finalRadius,
      label: label,
      color: "#9b87f5", // Viola neon
      position: { lat: targetLat, lng: targetLng },
      isAI: true,
      confidence: confidenceValue
    };
    
    console.log("Area generata:", newArea);
    console.log("AREA CREATA");
    
    // Log dei dettagli per debug
    console.log("Area generata:", {
      posizione: `${targetLat}, ${targetLng}`,
      label,
      confidence: confidenceValue,
      radius: finalRadius / 1000 + " km"
    });
    
    // Return the area and its ID for the caller
    return {
      areaId: newArea.id,
      area: newArea
    };
  } catch (error) {
    console.error("Errore nella generazione dell'area:", error);
    toast.error("Impossibile generare l'area di ricerca");
    return null;
  }
};
