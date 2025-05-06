
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { toast } from "sonner";

interface InviteFriendDialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteFriendDialog: React.FC<InviteFriendDialogProps> = ({
  open,
  onClose
}) => {
  const shareTitle = "Unisciti a M1SSION - La sfida inizia presto!";
  const shareDescription = "Ho scoperto questo nuovo gioco chiamato M1SSION e penso che ti piacerà. Dai un'occhiata e preparati per la sfida!";
  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiato negli appunti!", {
      description: "Ora puoi condividerlo con i tuoi amici"
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md glass-card border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron gradient-text-cyan text-center">
            Invita un amico
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Condividi M1SSION con i tuoi amici e preparatevi insieme all'avventura
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Sharing URL display */}
          <div className="flex items-center mb-6 bg-black/50 border border-white/10 rounded-lg p-2">
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-white/70">{shareUrl}</p>
            </div>
            <button 
              onClick={handleCopyLink}
              className="ml-2 px-3 py-1 text-sm bg-cyan-700/30 hover:bg-cyan-700/50 text-cyan-400 rounded-md transition-colors"
            >
              Copia
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-400 mb-2 font-semibold">Condividi sui social</h3>
              <div className="flex justify-center">
                <SocialShareButtons 
                  title={shareTitle} 
                  description={shareDescription} 
                  url={shareUrl} 
                  className="justify-center"
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <p className="text-center text-xs text-gray-400 mt-4">
                Ogni amico che si iscrive attraverso il tuo invito riceverà un bonus speciale all'avvio del gioco!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendDialog;
