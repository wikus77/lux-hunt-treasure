
import { useEffect } from "react";
import { usePrizeForm } from "./hooks/usePrizeForm";
import PrizeForm from "./PrizeForm";
import { MapPinIcon } from "lucide-react";

const AdminPrizeManager = () => {
  console.log("🟢 AdminPrizeManager rendering");
  
  useEffect(() => {
    console.log("🟢 AdminPrizeManager mounted");
  }, []);
  
  const { form, isLoading, onSubmit } = usePrizeForm();

  return (
    <div className="p-6 bg-black/80 border border-white/10 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="h-5 w-5 text-green-500" />
        <h2 className="text-xl font-bold text-white">Gestione Premi M1SSION</h2>
      </div>
      <p className="text-gray-400 mb-6">Inserisci i dettagli del premio e genera indizi automatici</p>
      
      <PrizeForm
        form={form}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default AdminPrizeManager;
