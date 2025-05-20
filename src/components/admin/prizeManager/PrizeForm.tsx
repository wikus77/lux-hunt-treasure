
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { PrizeFormValues } from "./hooks/usePrizeForm";
import { UseFormReturn } from "react-hook-form";
import { MapPinIcon, CalendarIcon, SaveIcon, AlertCircleIcon, RefreshCcwIcon, TargetIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PrizeFormProps {
  form: UseFormReturn<PrizeFormValues>;
  isLoading: boolean;
  onSubmit: (values: PrizeFormValues) => Promise<void>;
  geocodeError: string | null;
  showManualCoordinates: boolean;
  toggleManualCoordinates: () => void;
  handleRetry: () => void;
  isRetrying: boolean;
}

const PrizeForm = ({ 
  form, 
  isLoading, 
  onSubmit, 
  geocodeError, 
  showManualCoordinates, 
  toggleManualCoordinates,
  handleRetry,
  isRetrying
}: PrizeFormProps) => {
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
        
        {geocodeError && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Errore di geocoding</AlertTitle>
            <AlertDescription className="text-sm">
              {geocodeError}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry} 
                  disabled={isRetrying || isLoading}
                  className="text-xs"
                >
                  {isRetrying ? (
                    <>
                      <Spinner className="mr-2 h-3 w-3" />
                      Riprovo in corso...
                    </>
                  ) : (
                    <>
                      <RefreshCcwIcon className="mr-2 h-3 w-3" />
                      Riprova automatico (5s)
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleManualCoordinates} 
                  className="text-xs"
                >
                  <TargetIcon className="mr-2 h-3 w-3" />
                  {showManualCoordinates ? "Nascondi coordinate manuali" : "Inserisci coordinate manuali"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {showManualCoordinates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-md border border-white/10">
            <div className="col-span-full mb-2">
              <h3 className="text-white flex items-center gap-2 text-sm font-medium">
                <TargetIcon className="h-4 w-4" />
                Coordinate manuali
              </h3>
              <p className="text-xs text-gray-400">Inserisci le coordinate geografiche direttamente</p>
            </div>
            
            <FormField
              control={form.control}
              name="manual_lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm">
                    Latitudine
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Es: 45.4654219" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="manual_lng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm">
                    Longitudine
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Es: 9.1859243" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="use_manual_coordinates"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="use_manual_coordinates"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <FormLabel htmlFor="use_manual_coordinates" className="text-white text-sm cursor-pointer">
                      Usa coordinate manuali anziché geocoding
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
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
          disabled={isLoading || isRetrying}
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
