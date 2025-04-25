
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

const shareLinks = [
  {
    name: "WhatsApp",
    url: "https://wa.me/?text=Unisciti%20a%20M1SSION%20e%20ricevi%20indizi%20esclusivi!%20Scarica%20l%27app:%20https://m1ssion.app",
    color: "bg-[#25D366]",
    icon: "/lovable-uploads/whatsapp-logo.svg"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/?url=https://m1ssion.app",
    color: "bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-600",
    icon: "/lovable-uploads/instagram-logo.svg"
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=https://m1ssion.app",
    color: "bg-[#1877F3]",
    icon: "/lovable-uploads/facebook-logo.svg"
  },
  {
    name: "X / Twitter",
    url: "https://twitter.com/intent/tweet?text=Unisciti%20a%20M1SSION%20e%20sfida%20i%20tuoi%20amici%20%F0%9F%9A%80%20https://m1ssion.app",
    color: "bg-black",
    icon: "/lovable-uploads/twitter-logo.svg"
  },
  {
    name: "App Store",
    url: "https://apps.apple.com/app/id6463938860",
    color: "bg-gradient-to-br from-gray-300 via-gray-800 to-black",
    icon: "/lovable-uploads/apple-logo.svg"
  },
  {
    name: "Google Play",
    url: "https://play.google.com/store/apps/details?id=app.m1ssion",
    color: "bg-gradient-to-br from-yellow-400 via-green-500 to-green-800",
    icon: "/lovable-uploads/google-play-logo.svg"
  }
];

interface InviteOptionsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showIconsOnly?: boolean;
}

export default function InviteOptionsDialog({ open, onOpenChange, showIconsOnly }: InviteOptionsDialogProps) {
  // Modal aperta controllata via props solo se showIconsOnly==true
  const controlled = showIconsOnly && typeof open === "boolean" && typeof onOpenChange === "function";
  const actualOpen = controlled ? open : undefined;
  const actualOnOpenChange = controlled ? onOpenChange : undefined;

  return (
    <>
      {!showIconsOnly && (
        <Button 
          variant="accent"
          className="w-full max-w-xs mx-auto px-7 py-5 rounded-2xl text-xl font-bold flex items-center gap-2 shadow-xl neon-button-cyan hover:scale-105 transition-all"
          onClick={() => actualOnOpenChange && actualOnOpenChange(true)}
        >
          <Share className="w-7 h-7" />
          Invita un amico
        </Button>
      )}
      <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
        <DialogContent className="max-w-md bg-gradient-to-b from-black/90 via-zinc-900/90 to-cyan-950/90 border-cyan-500/40 glass-card p-8 animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400 flex items-center gap-3 mx-auto justify-center font-orbitron neon-text-cyan mb-2">
              <Share className="w-7 h-7" /> {showIconsOnly ? "Condividi M1SSION" : "Scegli App di Condivisione"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-center gap-6 px-2 mt-2">
            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-full p-4 shadow-xl glass-card ${link.color} hover:scale-125 transition-all duration-200 cursor-pointer flex items-center justify-center`}
                style={{
                  width: 72, height: 72,
                  boxShadow: "0 0 25px rgba(0,229,255,0.18), 0 4px 18px #151c3870"
                }}
                aria-label={link.name}
              >
                <img 
                  src={link.icon} 
                  alt={link.name} 
                  className="h-10 w-10 object-contain"
                  draggable={false}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0,229,255,0.3))"
                  }}
                />
              </a>
            ))}
          </div>
          <div className="flex mt-7 flex-col items-center justify-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="mt-2">
                Chiudi
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
