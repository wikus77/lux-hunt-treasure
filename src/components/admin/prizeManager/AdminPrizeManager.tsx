
import { useEffect } from "react";
import { usePrizeForm } from "./hooks/usePrizeForm";
import PrizeForm from "./PrizeForm";

const AdminPrizeManager = () => {
  console.log("🟢 AdminPrizeManager rendering");
  
  useEffect(() => {
    console.log("🟢 AdminPrizeManager mounted");
  }, []);
  
  const { form, isLoading, onSubmit } = usePrizeForm();

  return (
    <div className="p-6 bg-black/80 border border-white/10 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-white">Gestione Premi M1SSION</h2>
      <h3 className="text-lg text-green-500 mb-4">✅ AdminPrizeManager montato con successo</h3>
      
      <PrizeForm
        form={form}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default AdminPrizeManager;
