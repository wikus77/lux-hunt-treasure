
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Added missing import

type HelpDialogProps = {
  open: boolean;
  setOpen: (o: boolean) => void;
};

const HelpDialog: React.FC<HelpDialogProps> = ({ open, setOpen }) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Come usare la mappa interattiva</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-medium">Aggiungere un punto</h3>
          <p className="text-muted-foreground">Fai doppio click sulla mappa o usa il pulsante "Aggiungi punto" e poi clicca sulla mappa.</p>
        </div>
        <div>
          <h3 className="font-medium">Aggiungere un'area</h3>
          <p className="text-muted-foreground">Clicca sul pulsante "Aggiungi area" e poi clicca sulla mappa dove vuoi creare l'area.</p>
        </div>
        <div>
          <h3 className="font-medium">Modificare o eliminare</h3>
          <p className="text-muted-foreground">Clicca su un punto o un'area per aprire le opzioni di modifica o eliminazione.</p>
        </div>
        <div>
          <h3 className="font-medium">Funzione Buzz</h3>
          <p className="text-muted-foreground">Il pulsante Buzz analizza tutti gli indizi raccolti e aggiunge un'area di ricerca ottimizzata sulla mappa. Ogni click successivo riduce il raggio di 5km (minimo 50km).</p>
          <p className="text-muted-foreground mt-1">L'area Buzz può essere modificata o eliminata con una pressione prolungata su di essa.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default HelpDialog;
