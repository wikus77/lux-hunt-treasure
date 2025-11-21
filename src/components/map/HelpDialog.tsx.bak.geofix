
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Zap, Target } from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md mx-4 bg-black/95 border border-cyan-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Guida alla Mappa
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Scopri come utilizzare tutti gli strumenti della mappa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* BUZZ MAPPA */}
          <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-cyan-400">BUZZ MAPPA</span>
            </div>
            <p className="text-sm text-gray-300">
              Genera un'area di ricerca basata sui tuoi indizi. Il raggio si riduce ad ogni utilizzo.
            </p>
          </div>

          {/* Punti di Interesse */}
          <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span className="font-semibold text-purple-400">Punti di Interesse</span>
            </div>
            <p className="text-sm text-gray-300">
              Segna luoghi importanti sulla mappa per organizzare la tua ricerca.
            </p>
          </div>

          {/* Aree di Ricerca */}
          <div className="p-3 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-green-400" />
              <span className="font-semibold text-green-400">Aree di Ricerca</span>
            </div>
            <p className="text-sm text-gray-300">
              Crea cerchi personalizzati per definire zone di ricerca specifiche.
            </p>
          </div>

          {/* Controlli */}
          <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
            <p><strong>Tocca</strong> per aggiungere punti</p>
            <p><strong>Tocca e tieni premuto</strong> su un elemento per opzioni</p>
            <p><strong>Pizzica</strong> per ingrandire/ridurre</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => setOpen(false)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Ho capito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
