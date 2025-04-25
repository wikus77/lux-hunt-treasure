
import { useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, Clock } from "lucide-react";

// Carousel items
const cars = [
  {
    name: "Ferrari 488 GTB",
    image: "/events/ferrari-488-gtb.jpg",
    description: "Un motore da sogno, una missione da conquistare"
  },
  {
    name: "Lamborghini Huracan",
    image: "/events/lamborghini-huracan.jpg",
    description: "Adrenalina pura, dove solo i migliori osano"
  },
  {
    name: "Porsche 992",
    image: "/events/porsche-911.jpg",
    description: "Precisione tedesca, premio esclusivo"
  },
  {
    name: "Aston Martin DBX",
    image: "/lovable-uploads/ed5de774-31bd-4930-8b16-7af05790ab50.png",
    description: "Lusso britannico, avventura globale"
  },
  {
    name: "Lamborghini Urus",
    image: "/lovable-uploads/159027e7-9756-49fa-a771-b886e6c8f8e9.png",
    description: "Potenza e stile, sfida senza limiti"
  }
];

// Dummy event data for countdown
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

  // Live countdown update
  useState(() => {
    interval.current = setInterval(() => {
      setCountdown(formatCountdown(endTimestamp - Date.now()));
    }, 20000);
    return () => interval.current && clearInterval(interval.current);
  });

  return (
    <section className="w-full py-4 mt-2">
      <motion.div 
        className="mb-1 flex flex-col sm:flex-row items-center justify-between px-4"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <h2 className="gradient-text-cyan text-2xl font-bold font-orbitron mb-3 sm:mb-0">Missione Corrente</h2>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-white/60 text-sm">Tempo rimasto: <span className="font-orbitron text-cyan-400">{countdown}</span></span>
        </div>
      </motion.div>
      <Carousel>
        <CarouselContent>
          {cars.map((car, idx) => (
            <CarouselItem key={idx} className="flex flex-col items-center">
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-cyan-400/40 bg-black/70"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * idx }}
              >
                <img 
                  src={car.image}
                  alt={car.name}
                  className="w-full h-56 sm:h-64 object-cover rounded-2xl shadow-cyan-400/40"
                  style={{
                    filter: "drop-shadow(0 0 26px #00e5ff77)"
                  }}
                />
                <motion.div
                  className="absolute bottom-0 w-full px-4 py-2 bg-gradient-to-t from-black/80 to-transparent"
                  initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 * idx + 0.15 }}
                >
                  <span className="block text-lg text-cyan-300 font-bold">{car.name}</span>
                  <span className="block text-sm text-white italic">{car.description}</span>
                </motion.div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="text-right pr-4 mt-2">
        <button className="inline-flex items-center gap-1 font-bold text-sm gradient-text-cyan hover:underline hover:scale-105 transition" tabIndex={0}>
          Scopri i dettagli <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
