
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

interface PrizeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrizeDetailsModal = ({ isOpen, onClose }: PrizeDetailsModalProps) => {
  const prizes = [
    {
      name: "Lamborghini Huracán",
      description: "Vivi il brivido della velocità con una Lamborghini Huracán. Design aggressivo, motore ruggente e linee affilate: è più di un'auto, è una dichiarazione di potere. Solo un agente M1SSION potrà portarsela a casa.",
      image: "/lovable-uploads/211b98b7-646d-4c40-80d6-416ac71a54fc.png"
    },
    {
      name: "Ferrari SF90 Stradale",
      description: "Un'auto di lusso con prestazioni straordinarie, design all'avanguardia e tecnologia di punta.",
      image: "/events/ferrari-sf90.jpg"
    },
    {
      name: "Tesla Model S Plaid",
      description: "L'auto elettrica più veloce al mondo, con prestazioni da supercar e tecnologia all'avanguardia.",
      image: "/events/tesla-model-s.jpg"
    },
    {
      name: "Porsche 911 Turbo",
      description: "Un'icona dell'ingegneria automobilistica tedesca, perfetto equilibrio tra lusso e prestazioni.",
      image: "/events/porsche-911.jpg"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-black/80 backdrop-blur-md border border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            📦 Premi Esclusivi M1SSION
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            Ecco i premi che potrai vincere partecipando alle nostre missioni speciali. Solo i più veloci, astuti e determinati potranno conquistarli.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {prizes.map((prize, index) => (
            <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <div className="h-48 overflow-hidden rounded-md mb-4">
                <LazyImage 
                  src={prize.image} 
                  alt={prize.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-2">{prize.name}</h3>
              <p className="text-sm text-white/70">{prize.description}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
              Chiudi
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrizeDetailsModal;
