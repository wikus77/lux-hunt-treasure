
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
          <h3 className="font-medium">Visualizzazione del premio</h3>
          <p className="text-muted-foreground">L'area indicata con il cerchio azzurro rappresenta la zona approssimativa dove potrebbe trovarsi il premio.</p>
        </div>
        <div>
          <h3 className="font-medium">La tua posizione</h3>
          <p className="text-muted-foreground">Il marker sulla mappa indica la tua posizione attuale. Se non vedi il marker, potresti dover attivare la geolocalizzazione.</p>
        </div>
        <div>
          <h3 className="font-medium">Geolocalizzazione</h3>
          <p className="text-muted-foreground">Se non hai attivato la geolocalizzazione, vedrai un messaggio in fondo alla mappa. Tocca il messaggio per attivare la posizione.</p>
        </div>
        <div>
          <h3 className="font-medium">Controlli della mappa</h3>
          <p className="text-muted-foreground">Usa i controlli standard di Google Maps per spostarti, zoommare e cambiare visualizzazione.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default HelpDialog;
