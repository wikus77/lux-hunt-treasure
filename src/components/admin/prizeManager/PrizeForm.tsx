import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PrizeFormValues } from "./hooks/usePrizeForm";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrizeFormProps {
  form: UseFormReturn<PrizeFormValues>;
  isLoading: boolean;
  onSubmit: (values: PrizeFormValues) => void;
  geocodeError: string | null;
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
        {geocodeError && <p className="text-red-500 text-sm">{geocodeError}</p>}
        {geocodeError && (
          <Button variant="secondary" size="sm" onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Riprovo...
              </>
            ) : (
              'Riprova geocoding'
            )}
          </Button>
        )}
      </div>
      
      <div>
        <label className="inline-flex items-center">
          <Input type="checkbox" className="mr-2" checked={showManualCoordinates} onChange={toggleManualCoordinates} />
          Inserisci coordinate manualmente
        </label>
      </div>
      
      {showManualCoordinates && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manual_lat">Latitudine</Label>
            <Input 
              type="number" 
              id="manual_lat" 
              placeholder="Es: 45.4642"
              {...form.register("manual_lat", {
                valueAsNumber: true,
                min: -90,
                max: 90,
              })} 
            />
            {form.formState.errors.manual_lat && (
              <p className="text-red-500 text-sm">Latitudine non valida</p>
            )}
          </div>
          <div>
            <Label htmlFor="manual_lng">Longitudine</Label>
            <Input 
              type="number" 
              id="manual_lng" 
              placeholder="Es: 9.1900"
              {...form.register("manual_lng", {
                valueAsNumber: true,
                min: -180,
                max: 180,
              })} 
            />
            {form.formState.errors.manual_lng && (
              <p className="text-red-500 text-sm">Longitudine non valida</p>
            )}
          </div>
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
