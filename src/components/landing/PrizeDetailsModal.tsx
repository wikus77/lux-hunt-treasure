
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import ImagePreview from "@/components/ui/image-preview";
import { useLongPress } from "@/hooks/useLongPress";

interface PrizeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrizeDetailsModal = ({ isOpen, onClose }: PrizeDetailsModalProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const prizes = [
    {
      name: "Lamborghini Huracán",
      description: "Vivi il brivido della velocità con una Lamborghini Huracán. Design aggressivo, motore ruggente e linee affilate: è più di un'auto, è una dichiarazione di potere. Solo un agente M1SSION potrà portarsela a casa.",
      image: "/lovable-uploads/211b98b7-646d-4c40-80d6-416ac71a54fc.png"
    },
    {
      name: "Ferrari SF90 Stradale",
      description: "Un'auto di lusso con prestazioni straordinarie, design all'avanguardia e tecnologia di punta.",
      image: "/lovable-uploads/2f1f79ad-4221-4a49-a188-81e28222514d.png"
    },
    {
      name: "Aston Martin DBX",
      description: "Il SUV più elegante e potente mai prodotto da Aston Martin. Linee muscolose, prestazioni sportive e lusso senza compromessi per affrontare ogni missione con stile.",
      image: "/lovable-uploads/3b5f5a13-bb71-472b-9348-6e52c12cba7e.png"
    },
    {
      name: "Porsche 911 Turbo",
      description: "La Porsche 911 Turbo è il simbolo della perfezione tedesca: eleganza, potenza e precisione in un'unica auto. Un gioiello nero su quattro ruote per chi completa la M1SSION con intelligenza e velocità.",
      image: "/lovable-uploads/7bda6b4a-6ac6-489d-8b2f-b9a4f9c312a2.png"
    }
  ];

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              📦 Premi Esclusivi M1SSION
            </DialogTitle>
            <DialogDescription className="text-center text-white/70">
              Ecco i premi che potrai vincere partecipando alle nostre missioni speciali. Solo i più veloci, astuti e determinati potranno conquistarli.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-1 rounded-2xl shadow-xl p-6">
            {prizes.map((prize, index) => {
              const longPressProps = useLongPress(() => setPreviewImage(prize.image));
              
              return (
                <div 
                  key={index} 
                  className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/8 hover:scale-[1.02]"
                  style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 209, 255, 0.1)" }}
                >
                  <div 
                    className="h-48 overflow-hidden rounded-xl mb-4 cursor-pointer"
                    {...longPressProps}
                    onDoubleClick={() => setPreviewImage(prize.image)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setPreviewImage(prize.image);
                    }}
                  >
                    <LazyImage 
                      src={prize.image} 
                      alt={prize.name} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 rounded-xl"
                    />
                  </div>
                  <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-2">{prize.name}</h3>
                  <p className="text-sm text-white/70">{prize.description}</p>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full">
                Chiudi
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImagePreview 
        isOpen={!!previewImage}
        onClose={closePreview}
        imageUrl={previewImage || ""}
        alt="Prize preview"
      />
    </>
  );
};

export default PrizeDetailsModal;
