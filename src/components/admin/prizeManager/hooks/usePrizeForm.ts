
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
}

export const usePrizeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<PrizeFormValues>({
    defaultValues: {
      city: "",
      address: "",
      area_radius_m: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: ""
    }
  });

  const onSubmit = async (values: PrizeFormValues) => {
    try {
      setIsLoading(true);
      console.log("Submitting form with values:", values);
      
      // 1. Geocode the address
      const geocodeData = await geocodeAddress(values.city, values.address);
      console.log("Geocode response:", geocodeData);
      
      if (geocodeData.error || !geocodeData.lat || !geocodeData.lon) {
        throw new Error(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
      }
      
      // 2. Insert prize into the database
      const { data: prizeData, error: prizeError } = await createPrize(
        values, 
        parseFloat(geocodeData.lat),
        parseFloat(geocodeData.lon)
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
      const clueData = await generatePrizeClues({
        prizeId,
        city: values.city,
        address: values.address,
        lat: parseFloat(geocodeData.lat),
        lng: parseFloat(geocodeData.lon)
      });
      
      if (clueData.error || !clueData.clues) {
        throw new Error(clueData.error || "Impossibile generare gli indizi");
      }
      
      // 4. Insert clues into the database
      const insertResult = await insertPrizeClues(clueData.clues, prizeId);
      
      if (insertResult.error) {
        throw new Error(insertResult.error || "Errore durante il salvataggio degli indizi");
      }
      
      toast.success("Premio e indizi creati con successo!");
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
    onSubmit
  };
};
