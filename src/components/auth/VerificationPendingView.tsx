
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VerificationPendingView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-black/50 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-4 text-white">Verifica la tua email</h2>
        <p className="mb-6 text-white/80">
          Per completare la registrazione, controlla la tua casella email e clicca sul link di verifica.
        </p>
        <Button
          onClick={() => navigate("/login")}
          variant="outline"
          className="border-amber-500 text-amber-500 hover:bg-amber-500/20"
        >
          Torna al login
        </Button>
      </div>
    </div>
  );
};

export default VerificationPendingView;
