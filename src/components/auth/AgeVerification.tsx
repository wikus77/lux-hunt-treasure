
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface AgeVerificationProps {
  onVerified: () => void;
}

export const AgeVerification = ({ onVerified }: AgeVerificationProps) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const { toast } = useToast();

  const verifyAge = () => {
    // Validazioni base
    if (!day || !month || !year) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi della data di nascita."
      });
      return;
    }

    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    
    // Calcola età
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      toast({
        variant: "destructive",
        title: "Accesso negato",
        description: "Devi avere almeno 18 anni per registrarti."
      });
      return;
    }

    // Se l'età è maggiore di 18 anni
    onVerified();
  };

  return (
    <div className="glass-card w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 neon-text">Verifica dell'età</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Per partecipare a Project X devi avere almeno 18 anni. Inserisci la tua data di nascita per continuare.
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="day">Giorno</Label>
          <Input
            id="day"
            type="number"
            min="1"
            max="31"
            placeholder="GG"
            className="mt-1"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="month">Mese</Label>
          <Input
            id="month"
            type="number"
            min="1"
            max="12"
            placeholder="MM"
            className="mt-1"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="year">Anno</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            placeholder="AAAA"
            className="mt-1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>
      
      <Button 
        onClick={verifyAge} 
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
      >
        Verifica Età
      </Button>
    </div>
  );
};

export default AgeVerification;
