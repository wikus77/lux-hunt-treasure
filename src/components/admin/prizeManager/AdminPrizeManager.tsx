
import { useEffect } from "react";
import { usePrizeForm } from "./hooks/usePrizeForm";
import PrizeForm from "./PrizeForm";
import { MapPinIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPrizeManager = () => {
  console.log("🟢 AdminPrizeManager rendering");
  
  useEffect(() => {
    console.log("🟢 AdminPrizeManager mounted");
    
    // Check if user is authenticated
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("🧑‍💼 User ID attivo:", data?.user?.id);
      if (!data?.user) {
        alert("⚠️ Nessun utente loggato. Autenticati per inserire premi.");
      }
    });
  }, []);
  
  const { 
    form, 
    isLoading, 
    onSubmit, 
    geocodeError, 
    showManualCoordinates, 
    toggleManualCoordinates,
    handleRetry,
    isRetrying,
    isAuthenticated
  } = usePrizeForm();

  return (
    <div className="p-6 bg-black/80 border border-white/10 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="h-5 w-5 text-green-500" />
        <h2 className="text-xl font-bold text-white">Gestione Premi M1SSION</h2>
      </div>
      <p className="text-gray-400 mb-6">Inserisci i dettagli del premio e genera indizi automatici</p>
      
      {!isAuthenticated && (
        <div className="bg-red-500/30 border border-red-500/50 p-4 rounded-md mb-4">
          <p className="text-red-200 font-medium">⚠️ Utente non autenticato</p>
          <p className="text-red-200/80 text-sm">Effettua il login per inserire premi nel database.</p>
        </div>
      )}
      
      <PrizeForm
        form={form}
        isLoading={isLoading}
        onSubmit={onSubmit}
        geocodeError={geocodeError}
        showManualCoordinates={showManualCoordinates}
        toggleManualCoordinates={toggleManualCoordinates}
        handleRetry={handleRetry}
        isRetrying={isRetrying}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default AdminPrizeManager;
