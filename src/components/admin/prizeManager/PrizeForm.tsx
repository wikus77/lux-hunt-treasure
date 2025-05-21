
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PrizeFormValues } from "./hooks/usePrizeForm";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, Info, ChevronDown } from "lucide-react";

interface PrizeFormProps {
  form: UseFormReturn<PrizeFormValues>;
  isLoading: boolean;
  onSubmit: (values: PrizeFormValues) => void;
  geocodeError: string | null;
  geocodeResponse?: any | null;
  showManualCoordinates: boolean;
  toggleManualCoordinates: () => void;
  handleRetry: () => void;
  isRetrying: boolean;
  isAuthenticated?: boolean;
}

const PrizeForm: React.FC<PrizeFormProps> = ({
  form,
  isLoading,
  onSubmit,
  geocodeError,
  geocodeResponse,
  showManualCoordinates,
  toggleManualCoordinates,
  handleRetry,
  isRetrying,
  isAuthenticated = true
}) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="city">Città</Label>
        <Input type="text" id="city" {...form.register("city", { required: "La città è obbligatoria" })} />
        {form.formState.errors.city && (
          <p className="text-red-500 text-sm">{form.formState.errors.city.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="address">Indirizzo</Label>
        <Input type="text" id="address" {...form.register("address", { required: "L'indirizzo è obbligatorio" })} />
        {form.formState.errors.address && (
          <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
        )}
      </div>
      
      {/* Error and debugging section */}
      {geocodeError && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-300">Errore di geocoding</AlertTitle>
          <AlertDescription className="text-red-200">
            {geocodeError}
            <div className="mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="mr-2"
              >
                {isRetrying ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Riprovo...
                  </>
                ) : (
                  'Riprova geocoding'
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleManualCoordinates}
                className={showManualCoordinates ? "bg-blue-900/30" : ""}
              >
                {showManualCoordinates ? 'Nascondi coordinate manuali' : 'Inserisci coordinate manualmente'}
              </Button>
            </div>
          </AlertDescription>
          
          {geocodeResponse && (
            <Collapsible className="mt-4 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center w-full justify-start p-0 text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Mostra dettagli risposta</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(geocodeResponse, null, 2)}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Alert>
      )}
      
      {/* Manual coordinates input */}
      {showManualCoordinates && (
        <div className="glass-card p-4 rounded-md bg-blue-900/20 border border-blue-800/30">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Info className="h-4 w-4 mr-1 text-blue-400" />
            Inserimento coordinate manuali
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manual_lat">Latitudine</Label>
              <Input 
                type="text" 
                id="manual_lat" 
                placeholder="Es: 45.4642"
                {...form.register("manual_lat")} 
              />
              {form.formState.errors.manual_lat && (
                <p className="text-red-500 text-sm">Latitudine non valida</p>
              )}
            </div>
            <div>
              <Label htmlFor="manual_lng">Longitudine</Label>
              <Input 
                type="text" 
                id="manual_lng" 
                placeholder="Es: 9.1900"
                {...form.register("manual_lng")} 
              />
              {form.formState.errors.manual_lng && (
                <p className="text-red-500 text-sm">Longitudine non valida</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Show toggle button even without error */}
      {!geocodeError && (
        <div>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={toggleManualCoordinates}
            className={showManualCoordinates ? "bg-blue-900/30" : ""}
          >
            {showManualCoordinates ? 'Nascondi coordinate manuali' : 'Inserisci coordinate manualmente'}
          </Button>
        </div>
      )}
      
      <div>
        <Label htmlFor="area_radius_m">Raggio dell'area (metri)</Label>
        <Input 
          type="number" 
          id="area_radius_m" 
          {...form.register("area_radius_m", { 
            required: "Il raggio è obbligatorio",
            valueAsNumber: true,
            min: 100,
            max: 1000
          })} 
        />
        {form.formState.errors.area_radius_m && (
          <p className="text-red-500 text-sm">{form.formState.errors.area_radius_m.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data Inizio</Label>
          <Input type="date" id="start_date" {...form.register("start_date", { required: "La data di inizio è obbligatoria" })} />
          {form.formState.errors.start_date && (
            <p className="text-red-500 text-sm">{form.formState.errors.start_date.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="end_date">Data Fine (opzionale)</Label>
          <Input type="date" id="end_date" {...form.register("end_date")} />
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading || isRetrying || !isAuthenticated}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Salvataggio in corso...
            </>
          ) : (
            'Salva e genera indizi'
          )}
        </Button>
      </div>
      
      {!isAuthenticated && (
        <div className="text-amber-400 text-sm mt-2">
          Devi autenticarti prima di poter salvare premi.
        </div>
      )}
    </form>
  );
};

export default PrizeForm;
