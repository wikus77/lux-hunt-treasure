
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface InviteFriendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendDialog: React.FC<InviteFriendDialogProps> = ({ isOpen, onClose }) => {
  const [shareUrl] = useState("https://m1ssion.lovable.app");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success("Link copiato!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`🚗 Scopri M1SSION! La caccia al tesoro per vincere auto di lusso! ${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    
    // Track WhatsApp share event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('share_whatsapp');
    }
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border-cyan-400/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Invita un Amico</DialogTitle>
          <DialogDescription className="text-white/70">
            Condividi M1SSION con i tuoi amici e partecipate insieme alla caccia!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              value={shareUrl}
              readOnly
              className="bg-gray-800/50 border-gray-700 text-white"
            />
            <Button onClick={handleCopyUrl} size="icon" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {isCopied && (
            <p className="text-green-400 text-sm">✓ Link copiato negli appunti!</p>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleWhatsAppShare} className="flex-1 bg-green-600 hover:bg-green-700">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={handleCopyUrl}
              variant="outline" 
              className="flex-1"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copia Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendDialog;
