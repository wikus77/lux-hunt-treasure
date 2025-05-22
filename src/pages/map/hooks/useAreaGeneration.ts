
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";

/**
 * Generates a search area based on given parameters
 */
export function generateSearchArea(
  location: [number, number],
  notifications: any,
  customRadius?: number
): { areaId: string; area: SearchArea } | null {
  try {
    // Default radius if not provided
    const radius = customRadius || 500;
    
    // Generate a unique ID for the area
    const areaId = uuidv4();
    
    // Create the area object
    const area: SearchArea = {
      id: areaId,
      lat: location[0],
      lng: location[1],
      radius: radius,
      label: "Area generata",
      color: "#9b87f5",
      position: { lat: location[0], lng: location[1] },
      isAI: true
    };
    
    console.log("Area generata:", area);
    toast.success("Nuova area di ricerca generata");
    
    // Optionally, show a notification
    if (notifications?.length > 0) {
      notifications.push({
        id: areaId,
        title: "Nuova area generata",
        message: `Un'area di ${radius}m è stata generata`,
        type: "success",
        read: false
      });
    }
    
    return {
      areaId,
      area
    };
  } catch (error) {
    console.error("Errore nella generazione dell'area:", error);
    toast.error("Si è verificato un errore nella generazione dell'area");
    return null;
  }
}
