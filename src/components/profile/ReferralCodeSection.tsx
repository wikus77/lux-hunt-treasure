
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GradientBox from "@/components/ui/gradient-box";

const ReferralCodeSection = () => {
  const { toast } = useToast();
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText("AGENT-MR2025");
    toast({
      title: "Codice copiato",
      description: "Il codice referral è stato copiato negli appunti."
    });
  };

  return (
    <GradientBox className="mt-4 p-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-cyan-400" />
        <h4 className="text-sm font-bold">Codice referral</h4>
      </div>
      <div className="mt-2 flex">
        <Input 
          value="AGENT-MR2025" 
          readOnly 
          className="bg-black/40 text-sm" 
        />
        <Button 
          className="ml-2 bg-cyan-800 hover:bg-cyan-700"
          onClick={handleCopyReferralCode}
        >
          Copia
        </Button>
      </div>
      <span className="text-xs text-gray-400 block mt-2">
        Recluta un altro agente e ricevi 500 crediti
      </span>
    </GradientBox>
  );
};

export default ReferralCodeSection;
