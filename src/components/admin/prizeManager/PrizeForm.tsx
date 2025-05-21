
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PrizeFormValues } from "./hooks/usePrizeForm";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  AlertCircle, 
  Info, 
  ChevronDown, 
  Lock, 
  ShieldAlert, 
  MapPin, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";

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
  isAdmin?: boolean;
  authDebugInfo?: any;
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
  isAuthenticated = true,
  isAdmin = false,
  authDebugInfo = null
}) => {
  // Extract suggestions from geocode response if present
  const suggestions = geocodeResponse?.suggestions || [];
  const debugInfo = geocodeResponse?.debug;
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Authentication status */}
      {(!isAuthenticated || !isAdmin) && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-red-300">Accesso non autorizzato</AlertTitle>
          <AlertDescription className="text-red-200">
            {!isAuthenticated 
              ? "Devi autenticarti prima di poter salvare premi." 
              : "Solo gli amministratori possono salvare premi."}
            
            {authDebugInfo && (
              <Collapsible className="mt-4 w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center w-full justify-start p-0 text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Mostra dettagli autenticazione</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(authDebugInfo, null, 2)}</pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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
        {/* Formato consigliato */}
        <p className="text-xs text-gray-400 mt-1">
          <Info className="h-3 w-3 inline mr-1" />
          Formato consigliato: "Via Nome Via 123" (es. "Via Monte Napoleone 10")
        </p>
      </div>
      
      {/* Error and debugging section */}
      {geocodeError && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-300">Errore di geocoding</AlertTitle>
          <AlertDescription className="text-red-200">
            {geocodeError}
            
            {/* Suggestions for fixing the address */}
            {suggestions && suggestions.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="font-medium">Suggerimenti:</p>
                <ul className="list-disc ml-4 space-y-1 text-sm">
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRetry} 
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Riprovo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Riprova geocoding
                  </>
                )}
              </Button>
              
              <Button 
                variant={showManualCoordinates ? "default" : "outline"}
                size="sm" 
                onClick={toggleManualCoordinates}
                className={showManualCoordinates ? "bg-blue-700 hover:bg-blue-800" : ""}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {showManualCoordinates ? 'Nascondi coordinate manuali' : 'Inserisci coordinate manualmente'}
              </Button>
            </div>
          </AlertDescription>
          
          {debugInfo && (
            <Collapsible className="mt-4 w-full">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center w-full justify-start p-0 text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Mostra dettagli debug</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-2 bg-black/50 rounded text-xs font-mono overflow-auto max-h-64">
                  <div className="text-green-400 mb-1">Input originale:</div>
                  <pre className="whitespace-pre-wrap text-gray-300 mb-2">{JSON.stringify(debugInfo.originalInput, null, 2)}</pre>
                  
                  <div className="text-green-400 mb-1">Formati tentati:</div>
                  <pre className="whitespace-pre-wrap text-gray-300 mb-2">{JSON.stringify(debugInfo.formatsAttempted, null, 2)}</pre>
                  
                  <div className="text-green-400 mb-1">Risposte:</div>
                  <pre className="whitespace-pre-wrap text-gray-300">{JSON.stringify(debugInfo.responses, null, 2)}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Alert>
      )}
      
      {/* Manual coordinates input - now more visible and with instructions */}
      {showManualCoordinates && (
        <div className="glass-card p-4 rounded-md bg-blue-900/20 border border-blue-800/30">
          <h4 className="text-sm font-medium mb-2 flex items-center text-blue-300">
            <MapPin className="h-4 w-4 mr-1" />
            Inserimento coordinate manuali
          </h4>
          
          <p className="text-xs text-gray-300 mb-3">
            Puoi inserire direttamente le coordinate geografiche (latitudine e longitudine). 
            Puoi ottenerle da Google Maps cliccando con il tasto destro su un luogo.
          </p>
          
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
          
          {/* Use coordinates checkbox */}
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use_manual_coordinates"
                className="rounded border-gray-500"
                {...form.register("use_manual_coordinates")}
              />
              <Label htmlFor="use_manual_coordinates" className="text-sm">
                Usa queste coordinate anziché il geocoding
              </Label>
            </div>
            <p className="text-xs text-amber-300 mt-1">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Assicurati di inserire coordinate valide per l'Italia
            </p>
          </div>
        </div>
      )}
      
      {/* Show toggle button even without error */}
      {!geocodeError && !showManualCoordinates && (
        <div>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={toggleManualCoordinates}
            className="mt-1"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Inserisci coordinate manualmente
          </Button>
        </div>
      )}
      
      {/* Area radius */}
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
      
      {/* Dates */}
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
      
      {/* Submit button */}
      <div className="flex justify-end mt-6">
        <Button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading || isRetrying || !isAuthenticated || !isAdmin}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Salvataggio in corso...
            </>
          ) : (
            <>
              {(!isAuthenticated || !isAdmin) ? (
                <Lock className="mr-2 h-4 w-4" />
              ) : null}
              Salva e genera indizi
            </>
          )}
        </Button>
      </div>
      
      {/* Auth messages */}
      {!isAuthenticated && (
        <div className="text-amber-400 text-sm mt-2">
          Devi autenticarti prima di poter salvare premi.
        </div>
      )}
      
      {isAuthenticated && !isAdmin && (
        <div className="text-amber-400 text-sm mt-2">
          Solo gli utenti con ruolo admin possono salvare premi.
        </div>
      )}
    </form>
  );
};

export default PrizeForm;
