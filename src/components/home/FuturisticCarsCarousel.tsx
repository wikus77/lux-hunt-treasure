
import { useState } from "react";
import { motion } from "framer-motion";
import { CirclePlay } from "lucide-react";

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

export default function FuturisticCarsCarousel() {
  const [modalData, setModalData] = useState<{ name: string, image: string, trailer: string | null } | null>(null);

  return (
    <div className="w-full relative">
      <div className="flex gap-5 overflow-x-auto py-2 px-1 scrollbar-none">
        {cars.map((car, idx) => (
          <motion.div
            key={car.name}
            className="min-w-[260px] max-w-[340px] group relative rounded-2xl overflow-hidden shadow-xl border-4 border-cyan-400/80 bg-gradient-to-br from-black/90 to-cyan-900/50 cursor-pointer hover:scale-105 transition-all neon-border"
            style={{
              boxShadow: "0 0 32px 2px #00e5ff99"
            }}
            onClick={() => setModalData({ name: car.name, image: car.image, trailer: car.trailer })}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 * idx }}
            whileHover={{ scale: 1.08 }}
          >
            {/* Effetto Parallax Glow */}
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-40 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
              style={{
                filter: "drop-shadow(0 0 32px #00e5ffcf)",
                transform: "perspective(600px) rotateY(4deg)"
              }}
            />
            {/* Descrizione car animata */}
            <motion.div
              className="absolute bottom-0 w-full px-3 py-1.5 bg-gradient-to-t from-black/90 to-cyan-900/30"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + 0.07 * idx }}
            >
              <span className="block text-lg text-cyan-300 font-bold animate-fade-in">{car.name}</span>
              <span className="block text-white/90 text-sm italic animate-fade-in">{car.description}</span>
              <span className="inline-flex items-center gap-1 text-xs text-cyan-100 mt-1">
                <CirclePlay className="w-3 h-3 inline" /> {car.trailer ? "Guarda il trailer" : "Dettagli"}
              </span>
            </motion.div>
            {/* Glow Border */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400 neon-border animate-neon-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal dettagli/trailer */}
      {modalData && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center">
          <div className="bg-black rounded-2xl border-4 border-cyan-400 shadow-2xl p-6 max-w-xs sm:max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-cyan-400 hover:text-yellow-400 font-bold text-xl"
              aria-label="chiudi"
              onClick={() => setModalData(null)}
            >×</button>
            <img src={modalData.image} alt={modalData.name} className="mb-3 rounded-xl w-full h-32 object-cover" style={{filter:"drop-shadow(0 0 24px #00e5ffb6)"}} />
            <h3 className="text-xl font-orbitron neon-text-cyan mb-1">{modalData.name}</h3>
            {modalData.trailer ?
              <a href={modalData.trailer} target="_blank" rel="noopener noreferrer" className="underline text-cyan-200 hover:text-yellow-400 mt-2 block">Guarda il trailer della missione</a>
              : <span className="italic text-white/80">Trailer non disponibile</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}
