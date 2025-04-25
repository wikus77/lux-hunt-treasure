import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const futurePrizes = [
  {
    name: "Rolex Daytona Oro",
    image: "/lovable-uploads/a6250e9c-4a94-4357-b39c-e91ce9426e9e.png",
    description: "L’eleganza è la tua prossima conquista",
    date: "01/05/2025"
  },
  {
    name: "Rolex Daydate Oro Rosa (donna)",
    image: "/lovable-uploads/441b250e-b843-489a-9664-0b1f971fbc59.png",
    description: "Classe e rarità per chi merita di più",
    date: "01/06/2025"
  },
  {
    name: "Borsa Hermès Kelly",
    image: "/lovable-uploads/ddb0368c-4853-49a4-b8e2-70abf7594e0d.png",
    description: "Eleganza iconica al prossimo livello",
    date: "01/07/2025"
  },
  {
    name: "Borsa Hermès Birkin",
    image: "/lovable-uploads/a987ba21-940e-48cd-b999-c266de3f133c.png",
    description: "Lo stile che fa storia",
    date: "01/08/2025"
  },
  {
    name: "Ferrari Purosangue",
    image: "/lovable-uploads/b83c1e65-cd66-46ad-937b-60d7fd0c6a63.png",
    description: "Supercar da sogno, supera ogni limite",
    date: "01/09/2025"
  },
  {
    name: "Lamborghini Revuelto",
    image: "/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png",
    description: "Avanguardia e potenza in una nuova era",
    date: "01/10/2025"
  },
  {
    name: "Porsche Cayenne Coupe",
    image: "/lovable-uploads/507c2f6d-4ed0-46dc-b53c-79e1d5b7515e.png",
    description: "Una leggenda, ora è la tua occasione",
    date: "01/11/2025"
  },
  {
    name: "Aston Martin Vantage",
    image: "/lovable-uploads/b79099f5-31ab-44a3-b271-9cde8b7932e1.png",
    description: "Sportività ed eleganza dal Regno Unito",
    date: "01/12/2025"
  }
];

export default function FutureMissionsCarousel() {
  return (
    <section className="w-full py-4 mt-4">
      <motion.div 
        className="mb-2 flex items-center gap-2 px-4"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <h2 className="gradient-text-cyan text-2xl font-bold font-orbitron">Prossime Missioni</h2>
      </motion.div>
      <Carousel>
        <CarouselContent>
          {futurePrizes.map((prize, idx) => (
            <CarouselItem key={idx} className="flex flex-col items-center">
              <motion.div
                className="group relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple-400/80 bg-gradient-to-br from-black/80 to-purple-900/20 cursor-pointer hover:scale-105"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.09 * idx }}
                whileHover={{ scale: 1.07, rotateY: 2 }}
                style={{perspective:"800px"}}
              >
                <img
                  src={prize.image}
                  alt={prize.name}
                  className="w-full h-44 sm:h-48 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: "drop-shadow(0 0 32px #9b87f5f7)",
                    transform: "perspective(600px) rotateY(4deg)"
                  }}
                />
                <div className="absolute bottom-0 w-full px-4 py-2 bg-gradient-to-t from-purple-900/90 to-transparent">
                  <span className="block text-lg text-purple-300 font-bold animate-fade-in">{prize.name}</span>
                  <span className="block text-sm text-white italic mb-1 animate-fade-in">{prize.description}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-300 font-mono bg-white/10 px-2 py-0.5 rounded-lg">
                    <Calendar className="w-3 h-3" /> {prize.date}
                  </span>
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl border-4 border-purple-400 neon-border animate-neon-pulse" />
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
