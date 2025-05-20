
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const geocodeResponse = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/geocode-address", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            address: values.address, 
            city: values.city 
          })
        }
      );
      
      const geocodeData = await geocodeResponse.json();
      console.log("Geocode response:", geocodeData);
      
      if (geocodeData.error || !geocodeData.lat || !geocodeData.lon) {
        throw new Error(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
      }
      
      // 2. Insert prize into the database
      const { data: prizeData, error: prizeError } = await supabase
        .from("prizes")
        .insert({
          title: `Premio in ${values.city}`,
          location_address: `${values.address}, ${values.city}`,
          lat: parseFloat(geocodeData.lat),
          lng: parseFloat(geocodeData.lon),
          area_radius_m: values.area_radius_m,
          start_date: values.start_date,
          end_date: values.end_date || null,
          is_active: true
        })
        .select();
      
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
      
      // 4. Insert clues into the database
      await insertPrizeClues(clueData.clues, prizeId);
      
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

async function generatePrizeClues({ prizeId, city, address, lat, lng }: { 
  prizeId: string, 
  city: string, 
  address: string, 
  lat: number, 
  lng: number 
}) {
  const clueResponse = await fetch(
    "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/generate-prize-clues", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prizeId,
        city,
        address,
        lat,
        lng
      })
    }
  );
  
  const clueData = await clueResponse.json();
  console.log("Clue generation response:", clueData);
  
  if (clueData.error || !clueData.clues) {
    throw new Error(clueData.error || "Impossibile generare gli indizi");
  }
  
  return clueData;
}

async function insertPrizeClues(clues: any[], prizeId: string) {
  // Format clues for database insertion
  const formattedClues = clues.map((clue: any) => ({
    prize_id: prizeId,
    week: clue.week,
    clue_type: "regular",
    title_it: clue.title_it,
    title_en: clue.title_en,
    title_fr: clue.title_fr,
    description_it: clue.description_it,
    description_en: clue.description_en,
    description_fr: clue.description_fr
  }));
  
  console.log("Sending clues to insert function:", formattedClues);
  
  const insertResponse = await fetch(
    "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/insert-prize-clues", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clues_data: formattedClues })
    }
  );
  
  const insertResult = await insertResponse.json();
  console.log("Clue insert response:", insertResult);
  
  if (!insertResponse.ok || insertResult.error) {
    throw new Error(insertResult.error || "Errore durante il salvataggio degli indizi");
  }
  
  return insertResult;
}
