
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

const shareLinks = [
  {
    name: "WhatsApp",
    url: "https://wa.me/?text=Unisciti%20a%20M1SSION%20e%20ricevi%20indizi%20esclusivi!%20Scarica%20l%27app:%20https://m1ssion.app",
    color: "bg-green-500",
    icon: "/lovable-uploads/6ec76f7f-0e83-4005-8fb0-582ba83a7d60.png"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/?url=https://m1ssion.app",
    color: "bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-600",
    icon: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png"
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=https://m1ssion.app",
    color: "bg-blue-700",
    icon: "/lovable-uploads/cab356af-f03b-4b55-b5b3-ffc66c25841c.png"
  },
  {
    name: "X / Twitter",
    url: "https://twitter.com/intent/tweet?text=Unisciti%20a%20M1SSION%20e%20sfida%20i%20tuoi%20amici%20%F0%9F%9A%80%20https://m1ssion.app",
    color: "bg-black",
    icon: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png"
  },
  {
    name: "App Store",
    url: "https://apps.apple.com/app/id6463938860",
    color: "bg-gradient-to-r from-gray-300 to-black",
    icon: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png"
  },
  {
    name: "Google Play",
    url: "https://play.google.com/store/apps/details?id=app.m1ssion",
    color: "bg-gradient-to-r from-yellow-400 to-green-500",
    icon: "/lovable-uploads/ef2d64e7-7d7c-4753-9cbd-6208544255d5.png"
  }
];

export default function InviteOptionsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="accent" 
        className="w-full max-w-xs mx-auto px-7 py-3 rounded-2xl text-lg font-bold flex items-center gap-2 shadow-xl hover:scale-105"
        onClick={() => setOpen(true)}
      >
        <Share className="w-7 h-7" />
        Invita un amico
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-black/80 via-zinc-900/90 to-cyan-900/80 border-cyan-500/40 glass-card">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400 flex items-center gap-2">
              <Share className="w-6 h-6" /> Scegli come invitare
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white hover:scale-110 ${link.color} transition-transform duration-200 shadow-xl glass-card`}
              >
                <img src={link.icon} alt={link.name} className="h-6 w-6" />
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex mt-6 flex-col items-center justify-center gap-2">
            <span className="text-xs text-yellow-100/80 italic">Scarica o invita direttamente dai link!</span>
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
