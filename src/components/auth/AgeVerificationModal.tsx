
// © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface AgeVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ 
  open, 
  onClose, 
  onVerified 
}) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!day || !month || !year) {
      toast.error("Inserisci la data completa", {
        description: "Per favore inserisci giorno, mese e anno di nascita."
      });
      return;
    }

    const birthDate = new Date(`${year}-${month}-${day}`);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      toast.error("Data non valida", {
        description: "La data inserita non è valida."
      });
      return;
    }

    const age = calculateAge(birthDate);
    
    if (age >= 18) {
      toast.success("Età verificata", {
        description: "Grazie per aver verificato la tua età."
      });
      onVerified();
    } else {
      toast.error("Età non sufficiente", {
        description: "Devi avere almeno 18 anni per accedere a questo sito."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
        <div className="max-w-md w-full glass-card p-6"
             style={{ 
               transform: 'none',
               position: 'static',
               background: 'rgba(0, 12, 24, 0.95)',
               border: '1px solid rgba(0, 209, 255, 0.3)',
               borderRadius: '16px',
               backdropFilter: 'blur(20px)'
             }}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center neon-text">
            Verifica la tua età
          </h2>
          <p className="text-center text-muted-foreground">
            M1SSION richiede che tu abbia almeno 18 anni per poter accedere.
          </p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="day">Giorno</Label>
                <input
                  id="day"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="GG"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-black text-white rounded-md"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="month">Mese</Label>
                <input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-black text-white rounded-md"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="year">Anno</Label>
                <input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="AAAA"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-black text-white rounded-md"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white rounded-full"
            >
              Verifica
            </Button>
          </form>
          
           <p className="text-xs text-center text-muted-foreground">
             Inserendo la tua data di nascita, confermi di avere almeno 18 anni e accetti i nostri Termini e Condizioni.
           </p>
         </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationModal;
