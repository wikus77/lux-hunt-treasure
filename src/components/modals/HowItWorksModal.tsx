
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-black text-white border-projectx-neon-blue">
        <DialogHeader>
          <DialogTitle className="text-projectx-neon-blue font-bold text-xl">Come Funziona</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="text-sm mt-2 space-y-3 max-h-[60vh] overflow-y-auto">
            <p>
              <strong>M1SSION</strong> offre un'esperienza unica che combina la caccia al tesoro con la possibilità di vincere auto di lusso. Ecco come partecipare e aumentare le tue possibilità di vincita:
            </p>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong>Un Mese di Indizi:</strong> 4 settimane di indizi, uno a settimana, per aiutarti a trovare l'auto in palio.</li>
              <li><strong>Notifiche:</strong> Ricevi notifiche quando sono disponibili nuovi indizi.</li>
              <li><strong>Pacchetti Premium:</strong> Più dettagli e foto esclusive, geolocalizzazione avanzata. Silver, Gold e Black con vantaggi crescenti.</li>
              <li><strong>Vincita:</strong> Il primo che risolve tutti gli indizi e trova l’auto vince. L’assegnazione è certificata da ente esterno per la massima trasparenza.</li>
            </ul>
            <p>Per vincere analizza subito ogni indizio, valuta i pacchetti premium e agisci rapidamente se pensi di aver trovato la soluzione!</p>
          </div>
        </DialogDescription>
        <Button onClick={onClose} className="mt-4 w-full bg-projectx-neon-blue text-black font-bold hover:bg-blue-400 rounded">Chiudi</Button>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksModal;
