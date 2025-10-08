
import { useEffect } from "react";
import { usePrizeForm } from "./hooks/usePrizeForm";
import PrizeForm from "./PrizeForm";
import PrizeTableDebug from "./PrizeTableDebug";
import { MapPinIcon, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPrizeManager = () => {
  console.log("🟢 AdminPrizeManager rendering");
  
  useEffect(() => {
    console.log("🟢 AdminPrizeManager mounted");
    
    // Check if user is authenticated
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("🧑‍💼 User ID attivo:", data?.user?.id);
      if (!data?.user) {
        console.warn("⚠️ Nessun utente loggato. Autenticati per inserire premi.");
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
    isAuthenticated,
    isAdmin,
    authDebugInfo,
    geocodeResponse
  } = usePrizeForm();

  return (
    <div className="p-6 bg-black/80 border border-white/10 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="h-5 w-5 text-green-500" />
        <h2 className="text-xl font-bold text-white">Gestione Premi M1SSION</h2>
        
        {isAdmin && (
          <div className="flex items-center gap-1 ml-auto bg-green-900/30 px-2 py-1 rounded text-xs text-green-300 border border-green-800/50">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </div>
        )}
      </div>
      <p className="text-gray-400 mb-6">Inserisci i dettagli del premio e genera indizi automatici</p>
      
      {!isAuthenticated && (
        <div className="bg-red-500/30 border border-red-500/50 p-4 rounded-md mb-4">
          <p className="text-red-200 font-medium">⚠️ Utente non autenticato</p>
          <p className="text-red-200/80 text-sm">Effettua il login per inserire premi nel database.</p>
        </div>
      )}
      
      {isAuthenticated && !isAdmin && (
        <div className="bg-amber-500/30 border border-amber-500/50 p-4 rounded-md mb-4">
          <p className="text-amber-200 font-medium">⚠️ Permessi insufficienti</p>
          <p className="text-amber-200/80 text-sm">Solo gli amministratori possono inserire premi.</p>
        </div>
      )}
      
      <PrizeForm
        form={form}
        isLoading={isLoading}
        onSubmit={onSubmit}
        geocodeError={geocodeError}
        geocodeResponse={geocodeResponse}
        showManualCoordinates={showManualCoordinates}
        toggleManualCoordinates={toggleManualCoordinates}
        handleRetry={handleRetry}
        isRetrying={isRetrying}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        authDebugInfo={authDebugInfo}
      />
      
      <PrizeTableDebug />
    </div>
  );
};

export default AdminPrizeManager;
