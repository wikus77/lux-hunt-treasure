
import { useState } from "react";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PaymentMethods = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+64px)]">
        <h1 className="text-xl font-semibold text-white mb-4">Metodi di Pagamento</h1>
        
        <button
          onClick={() => navigate(-1)}
          className="w-6 h-6 text-white relative z-50 mb-6"
          aria-label="Torna alla pagina precedente"
        >
          <ArrowLeft />
        </button>
      </div>

      <div className="p-4">
        <div className="glass-card rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-projectx-neon-blue" />
            I tuoi Metodi di Pagamento
          </h2>
          
          <p className="text-white/70 mb-4">Gestisci i tuoi metodi di pagamento...</p>
          
          <Button className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Metodo di Pagamento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
