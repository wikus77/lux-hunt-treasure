
import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/avatar';

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  player: any | null;
}

export function CreateTeamDialog({ open, onClose, player }: CreateTeamDialogProps) {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = () => {
    if (!teamName.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per la squadra",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Squadra creata!",
        description: `Hai creato "${teamName}" e invitato ${player?.name}`
      });
      setIsLoading(false);
      setTeamName('');
      onClose();
    }, 1000);
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-cyan-400 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crea una nuova squadra
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="mb-6">
            <Label htmlFor="teamName">Nome della squadra</Label>
            <Input 
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Inserisci un nome per la tua squadra"
              className="bg-black/60 border-gray-700 mt-1"
              autoComplete="off"
              maxLength={30}
            />
          </div>

          <div className="bg-black/50 p-4 rounded-lg border border-white/5">
            <p className="text-sm text-white/70 mb-2">Invita giocatore:</p>
            
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-white/10">
                <img src={player.avatar} alt={player.name} />
              </Avatar>
              <div>
                <p className="font-medium text-white">{player.name}</p>
                <p className="text-xs text-white/50">Rank #{player.rank}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !teamName.trim()}>
            {isLoading ? "Creazione..." : "Crea e Invita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
