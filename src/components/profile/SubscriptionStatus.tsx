
import { Button } from "@/components/ui/button";

const SubscriptionStatus = () => {
  return (
    <div className="glass-card mb-4">
      <h3 className="text-lg font-bold mb-2">Stato Abbonamento</h3>
      
      <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-projectx-blue to-projectx-neon-blue">
        <div className="flex justify-between items-center">
          <span className="font-bold">Base</span>
          <span className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-30">
            Gratuito
          </span>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
      >
        Aggiorna Abbonamento
      </Button>
    </div>
  );
};

export default SubscriptionStatus;
