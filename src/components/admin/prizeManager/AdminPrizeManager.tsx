
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";
import { Spinner } from "@/components/ui/spinner";

interface PrizeFormValues {
  city: string;
  address: string;
  area_radius_m: number;
  start_date: string;
  end_date: string;
}

const AdminPrizeManager = () => {
  const { hasRole } = useAuthContext();
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

  if (!hasRole("admin")) {
    return null; // Don't render anything if user is not an admin
  }

  const onSubmit = async (values: PrizeFormValues) => {
    try {
      setIsLoading(true);
      
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
      
      if (prizeError || !prizeData || prizeData.length === 0) {
        throw new Error(prizeError?.message || "Errore durante il salvataggio del premio");
      }

      const prizeId = prizeData[0].id;
      
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
      
      if (clueData.error || !clueData.clues) {
        throw new Error(clueData.error || "Impossibile generare gli indizi");
      }
      
      // 4. Insert clues into the database
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
      
      const { error: cluesError } = await supabase
        .from("prize_clues")
        .insert(clues);
      
      if (cluesError) {
        throw new Error(cluesError?.message || "Errore durante il salvataggio degli indizi");
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
