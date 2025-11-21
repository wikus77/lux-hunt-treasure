
import { useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import ImagePreview from "@/components/ui/image-preview";
import { useLongPress } from "@/hooks/useLongPress";

const cars = [
  {
    name: "Ferrari 488 GTB",
    image: "/events/ferrari-488-gtb.jpg",
    description: "Un motore da sogno, una missione da conquistare",
    trailer: "https://www.youtube.com/watch?v=UAO2urG23S4"
  },
  {
    name: "Lamborghini Huracan",
    image: "/events/lamborghini-huracan.jpg",
    description: "Adrenalina pura, dove solo i migliori osano",
    trailer: "https://www.youtube.com/watch?v=vtBrewMd2bU"
  },
  {
    name: "Porsche 992",
    image: "/events/porsche-911.jpg",
    description: "Precisione tedesca, premio esclusivo",
    trailer: "https://www.youtube.com/watch?v=OQe58UZAPdU"
  },
  {
    name: "Aston Martin DBX",
    image: "/lovable-uploads/ed5de774-31bd-4930-8b16-7af05790ab50.png",
    description: "Lusso britannico, avventura globale",
    trailer: null
  },
  {
    name: "Lamborghini Urus",
    image: "/lovable-uploads/159027e7-9756-49fa-a771-b886e6c8f8e9.png",
    description: "Potenza e stile, sfida senza limiti",
    trailer: null
  }
];

const endTimestamp = new Date().getTime() + 7 * 86400 * 1000 + 2 * 3600 * 1000 + 34 * 60 * 1000;
function formatCountdown(timeMs: number) {
  const days = Math.floor(timeMs / 86400000);
  const hours = Math.floor((timeMs % 86400000) / 3600000);
  const mins = Math.floor((timeMs % 3600000) / 60000);
  return `${days} giorni, ${hours.toString().padStart(2, "0")} ore, ${mins.toString().padStart(2, "0")} min`;
}

export default function EventCarousel() {
  const [countdown, setCountdown] = useState(formatCountdown(endTimestamp - Date.now()));
  const interval = useRef<NodeJS.Timeout | null>(null);
  const [modalData, setModalData] = useState<{ name: string, image: string, trailer: string | null } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useState(() => {
    interval.current = setInterval(() => {
      setCountdown(formatCountdown(endTimestamp - Date.now()));
    }, 20000);
    return () => interval.current && clearInterval(interval.current);
  });

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <section className="w-full py-4 mt-2 relative">
      <motion.div 
        className="mb-1 flex flex-col sm:flex-row items-center justify-between px-4"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <h2 className="gradient-text-cyan text-2xl font-bold font-orbitron mb-3 sm:mb-0">Auto in Palio</h2>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-white/60 text-sm">Tempo rimasto: <span className="font-orbitron text-cyan-400">{countdown}</span></span>
        </div>
      </motion.div>
      <Carousel>
        <CarouselContent>
          {cars.map((car, idx) => {
            const longPressProps = useLongPress(() => {
              setPreviewImage(car.image);
            });

            return (
              <CarouselItem key={idx} className="flex flex-col items-center">
                <motion.div
                  className="group relative rounded-2xl overflow-hidden shadow-xl border-4 border-cyan-400/70 bg-gradient-to-br from-black/90 to-cyan-900/40 cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * idx }}
                  onClick={() => setModalData({ name: car.name, image: car.image, trailer: car.trailer })}
                  whileHover={{ scale: 1.04, boxShadow: "0 0 28px #00e5fff7" }}
                >
                  <div
                    {...longPressProps}
                    onDoubleClick={() => setPreviewImage(car.image)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setPreviewImage(car.image);
                    }}
                  >
                    <img 
                      src={car.image}
                      alt={car.name}
                      className="w-full h-56 sm:h-64 object-cover rounded-2xl shadow-cyan-400/80 group-hover:scale-105 transition-transform duration-300"
                      style={{
                        filter: "drop-shadow(0 0 40px #00e5ff90)",
                        transform: "perspective(800px) rotateY(-4deg)"
                      }}
                    />
                  </div>
                  <motion.div
                    className="absolute bottom-0 w-full px-4 py-3 bg-gradient-to-t from-black/95 to-cyan-900/30"
                    initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 * idx + 0.15 }}
                  >
                    <span className="block text-lg text-cyan-300 font-bold animate-fade-in">{car.name}</span>
                    <span className="block text-sm text-white italic animate-fade-in">{car.description}</span>
                    <span className="block text-cyan-100/70 mt-1 text-xs">Clicca per dettagli</span>
                  </motion.div>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 neon-border animate-neon-pulse" />
                  </div>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {modalData && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center px-4">
          <div className="bg-black rounded-2xl border-4 border-cyan-400/80 shadow-2xl p-6 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-cyan-400 hover:text-yellow-400 font-bold text-xl"
              aria-label="chiudi"
              onClick={() => setModalData(null)}
            >×</button>
            <img 
              src={modalData.image} 
              alt={modalData.name} 
              className="mb-3 rounded-xl w-full h-44 object-cover" 
              style={{filter:"drop-shadow(0 0 24px #00e5ff8c)"}} 
            />
            <h3 className="text-xl font-orbitron neon-text-cyan mb-1">{modalData.name}</h3>
            {modalData.trailer 
              ? <a href={modalData.trailer} target="_blank" rel="noopener noreferrer" className="underline text-cyan-200 hover:text-yellow-400 mt-2 block">Guarda il trailer della missione</a>
              : <span className="italic text-white/80">Trailer non disponibile</span>
            }
          </div>
        </div>
      )}

      <ImagePreview 
        isOpen={!!previewImage}
        onClose={closePreview}
        imageUrl={previewImage || ""}
        alt="Car preview"
      />
    </section>
  );
}
