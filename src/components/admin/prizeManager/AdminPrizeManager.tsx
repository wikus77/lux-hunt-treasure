
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";

interface PrizeFormValues {
  city: string;
  address: string;
  area_radius_m: number;
  start_date: string;
  end_date: string;
}

const AdminPrizeManager = () => {
  console.log("🟢 AdminPrizeManager rendering");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log("🟢 AdminPrizeManager mounted");
  }, []);
  
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
      const clueResponse = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/generate-prize-clues", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prizeId,
            city: values.city,
            address: values.address,
            lat: parseFloat(geocodeData.lat),
            lng: parseFloat(geocodeData.lon)
          })
        }
      );
      
      const clueData = await clueResponse.json();
      console.log("Clue generation response:", clueData);
      
      if (clueData.error || !clueData.clues) {
        throw new Error(clueData.error || "Impossibile generare gli indizi");
      }
      
      // 4. Insert clues into the database using our edge function
      const clues = clueData.clues.map((clue: any) => ({
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
      
      console.log("Sending clues to insert function:", clues);
      
      const insertResponse = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/insert-prize-clues", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clues_data: clues })
        }
      );
      
      const insertResult = await insertResponse.json();
      console.log("Clue insert response:", insertResult);
      
      if (!insertResponse.ok || insertResult.error) {
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

  return (
    <div className="p-6 bg-black/80 border border-white/10 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-white">Gestione Premi M1SSION</h2>
      <h3 className="text-lg text-green-500 mb-4">✅ AdminPrizeManager montato con successo</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Città</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Es: Milano" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Indirizzo completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Es: Via Montenapoleone 10" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="area_radius_m"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Raggio (metri)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="500" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data inizio</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data fine (opzionale)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Elaborazione...
              </>
            ) : (
              "Salva Premio e Genera Indizi"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminPrizeManager;
