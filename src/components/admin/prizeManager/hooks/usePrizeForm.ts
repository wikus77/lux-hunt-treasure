
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { geocodeAddress, createPrize, generatePrizeClues, insertPrizeClues } from "../services/prizeService";

export interface PrizeFormValues {
  city: string;
  address: string;
  area_radius_m: number;
  start_date: string;
  end_date: string;
  // Manual coordinates for fallback
  manual_lat?: string;
  manual_lng?: string;
  use_manual_coordinates?: boolean;
}

export const usePrizeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const form = useForm<PrizeFormValues>({
    defaultValues: {
      city: "",
      address: "",
      area_radius_m: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      manual_lat: "",
      manual_lng: "",
      use_manual_coordinates: false
    }
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    const values = form.getValues();
    
    // Wait 5 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    onSubmit(values).finally(() => {
      setIsRetrying(false);
    });
  };
  
  const toggleManualCoordinates = () => {
    setShowManualCoordinates(prev => !prev);
    form.setValue("use_manual_coordinates", !showManualCoordinates);
  };

  const onSubmit = async (values: PrizeFormValues) => {
    try {
      setIsLoading(true);
      setGeocodeError(null);
      console.log("Submitting form with values:", values);
      
      let lat: number;
      let lon: number;
      
      // Check if using manual coordinates
      if (values.use_manual_coordinates && values.manual_lat && values.manual_lng) {
        lat = parseFloat(values.manual_lat);
        lon = parseFloat(values.manual_lng);
        
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          throw new Error("Coordinate inserite non valide. Latitude: -90 to 90, Longitude: -180 to 180.");
        }
        
        console.log("Using manual coordinates:", { lat, lon });
      } else {
        // 1. Geocode the address to get coordinates
        toast.info("Geolocalizzazione indirizzo...");
        const geocodeData = await geocodeAddress(values.city, values.address);
        console.log("Geocode response:", geocodeData);
        
        if (geocodeData.error || !geocodeData.lat || !geocodeData.lon) {
          // Set error state for UI
          setGeocodeError(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
          
          // Show specific error message based on error type
          if (geocodeData.errorType === 'rate_limit') {
            toast.error("Rate limit superato", { 
              description: "Troppe richieste a Nominatim. Riprova tra qualche istante o inserisci coordinate manualmente." 
            });
          } else if (geocodeData.errorType === 'not_found') {
            toast.error("Indirizzo non trovato", { 
              description: "Prova a inserire un indirizzo più specifico o le coordinate manualmente." 
            });
          } else {
            toast.error("Errore di geocoding", { 
              description: geocodeData.error || "Errore imprevisto durante la geolocalizzazione." 
            });
          }
          
          // Enable manual coordinate input
          setShowManualCoordinates(true);
          form.setValue("use_manual_coordinates", true);
          
          throw new Error(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
        }
        
        lat = parseFloat(geocodeData.lat);
        lon = parseFloat(geocodeData.lon);
      }
      
      // 2. Insert prize into the database
      toast.info("Salvataggio premio...");
      const { data: prizeData, error: prizeError } = await createPrize(
        values, 
        lat,
        lon
      );
      
      console.log("Prize insert response:", { data: prizeData, error: prizeError });
      
      if (prizeError) {
        throw new Error(prizeError?.message || "Errore durante il salvataggio del premio");
      }

      if (!prizeData || prizeData.length === 0) {
        throw new Error("Nessun dato ritornato dopo l'inserimento del premio");
      }

      const prizeId = prizeData[0].id;
      console.log("Created prize with ID:", prizeId);
      
      // 3. Generate clues
      toast.info("Generazione indizi...");
      const clueData = await generatePrizeClues({
        prizeId,
        city: values.city,
        address: values.address,
        lat: lat,
        lng: lon
      });
      
      console.log("Generated clues:", clueData);
      
      if (clueData.error || !clueData.clues) {
        throw new Error(clueData.error || "Impossibile generare gli indizi");
      }
      
      // 4. Insert clues into the database
      toast.info("Salvataggio indizi...");
      const insertResult = await insertPrizeClues(clueData.clues, prizeId);
      
      console.log("Clues insertion result:", insertResult);
      
      if (insertResult.error) {
        throw new Error(insertResult.error || "Errore durante il salvataggio degli indizi");
      }
      
      // Success!
      toast.success("Premio e indizi creati con successo!", {
        description: `Salvato premio in ${values.city} con ${clueData.clues.length} indizi.`
      });
      
      // Reset form after success
      setGeocodeError(null);
      setShowManualCoordinates(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating prize:", error);
      toast.error("Errore", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
    geocodeError,
    showManualCoordinates,
    toggleManualCoordinates,
    handleRetry,
    isRetrying
  };
};
