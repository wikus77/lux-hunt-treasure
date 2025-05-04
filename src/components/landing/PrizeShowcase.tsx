
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const prizes = [
  {
    name: "Ferrari SF90 Stradale",
    image: "/events/ferrari-sf90.jpg",
    description: "Potenza straordinaria e tecnologia all'avanguardia. La SF90 Stradale è la prima Ferrari PHEV (Plug-in Hybrid Electric Vehicle) di serie nella storia del Cavallino Rampante."
  },
  {
    name: "Lamborghini Huracán",
    image: "/events/lamborghini-huracan.jpg", 
    description: "Un vero e proprio fulmine a V10 che emette un rombo inconfondibile, con prestazioni a dir poco esaltanti. Design senza compromessi, la quintessenza della sportività."
  },
  {
    name: "Porsche 911",
    image: "/events/porsche-911.jpg",
    description: "L'iconica supercar tedesca che definisce la perfezione ingegneristica. Un simbolo di precisione e prestazioni dal design senza tempo."
  },
  {
    name: "Tesla Model S",
    image: "/events/tesla-model-s.jpg",
    description: "L'auto elettrica ad alte prestazioni per eccellenza. Accelerazione fulminea e autonomia senza precedenti."
  }
];

const PrizeShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === prizes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? prizes.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-black via-[#080818] to-black">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1),rgba(0,0,0,0)_60%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-cyan-400 mb-2 text-lg font-light tracking-wider uppercase">Il premio</h2>
          <h3 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-cyan mb-6">Auto di Lusso in Palio</h3>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Ogni mese una nuova auto di lusso diventa l'obiettivo della caccia. Trova gli indizi, scopri il tesoro e cambia la tua vita.
          </p>
        </motion.div>

        <div className="relative">
          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Carousel */}
          <div className="relative h-[28rem] overflow-hidden rounded-xl">
            {prizes.map((prize, idx) => (
              <motion.div
                key={idx}
                className={`absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-8 transition-all duration-500`}
                initial={{ opacity: 0, x: idx > currentIndex ? 100 : -100 }}
                animate={{ 
                  opacity: idx === currentIndex ? 1 : 0,
                  x: idx === currentIndex ? 0 : idx > currentIndex ? 100 : -100,
                  zIndex: idx === currentIndex ? 10 : 0
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full md:w-1/2 relative overflow-hidden rounded-lg">
                  <img 
                    src={prize.image} 
                    alt={prize.name} 
                    className="w-full h-64 md:h-96 object-cover object-center rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>

                <div className="w-full md:w-1/2 text-center md:text-left p-4">
                  <h3 className="text-2xl md:text-4xl font-orbitron font-bold mb-4 text-white">{prize.name}</h3>
                  <p className="text-white/70 text-lg mb-6">{prize.description}</p>
                  <div className="mission-motto text-yellow-400 text-xl">È POSSIBILE.</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={nextSlide}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-3 mt-6">
          {prizes.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-cyan-400 w-6" : "bg-white/30"
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrizeShowcase;
