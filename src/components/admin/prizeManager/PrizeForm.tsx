
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { PrizeFormValues } from "./hooks/usePrizeForm";
import { UseFormReturn } from "react-hook-form";
import { MapPinIcon, CalendarIcon, SaveIcon } from "lucide-react";

interface PrizeFormProps {
  form: UseFormReturn<PrizeFormValues>;
  isLoading: boolean;
  onSubmit: (values: PrizeFormValues) => Promise<void>;
}

const PrizeForm = ({ form, isLoading, onSubmit }: PrizeFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Città
                </FormLabel>
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
                <FormLabel className="text-white flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Indirizzo completo
                </FormLabel>
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
                <FormLabel className="text-white flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Raggio (metri)
                </FormLabel>
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
                <FormLabel className="text-white flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data inizio
                </FormLabel>
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
                <FormLabel className="text-white flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data fine (opzionale)
                </FormLabel>
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
          className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:brightness-110 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Elaborazione...
            </>
          ) : (
            <>
              <SaveIcon className="mr-2 h-4 w-4" />
              Salva Premio e Genera Indizi
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PrizeForm;
