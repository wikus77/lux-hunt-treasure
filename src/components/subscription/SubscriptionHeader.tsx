
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SubscriptionHeader = () => {
  const navigate = useNavigate();
  
  return (
    <section className="w-full py-8">
      <h2 className="text-2xl font-bold mb-3 px-4 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">
        Scegli il Tuo Piano
      </h2>
      <p className="text-base text-white/70 mb-8 px-4 text-center max-w-2xl mx-auto">
        Sblocca più indizi e aumenta le tue possibilità di vittoria con i nostri pacchetti premium.
      </p>
    </section>
  );
};
