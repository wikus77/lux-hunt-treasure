
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aiuto Mappa</DialogTitle>
          <DialogDescription>
            Come utilizzare la mappa BUZZ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Aggiungere punti</h3>
            <p className="text-sm text-gray-600">
              Clicca sull'icona "+" e poi sulla mappa per aggiungere un punto di interesse.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Aree di ricerca</h3>
            <p className="text-sm text-gray-600">
              Usa il pulsante area per creare zone di ricerca personalizzate.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">BUZZ</h3>
            <p className="text-sm text-gray-600">
              Il pulsante BUZZ genera aree casuali per esplorare la città.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
