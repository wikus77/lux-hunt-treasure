
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Info } from "lucide-react";
import { CarDetailsModal, CarDetails } from "@/components/home/CarDetailsModal";

// Car data with the uploaded images
const LUXURY_CARS = [
  {
    id: "lamborghini",
    name: "Lamborghini Huracán",
    description: "Potenza pura e design audace, una supercar che ridefinisce il concetto di velocità.",
    specs: "5.2L V10 • 640 CV • 0-100 km/h in 2.9s",
    image: "/lovable-uploads/90cbccd3-a237-404e-be56-89d82f6a9838.png",
    color: "#FFC107",
    engine: "V10 5.2L, 640 CV",
    acceleration: "0-100 km/h in 2.9s",
    prize: "Premio speciale per i vincitori delle sfide di abilità."
  },
  {
    id: "porsche",
    name: "Porsche 911 GT3",
    description: "Precisione ingegneristica tedesca, il simbolo della perfezione su strada e in pista.",
    specs: "4.0L Flat-6 • 510 CV • 0-100 km/h in 3.4s",
    image: "/lovable-uploads/f890fc27-9f45-43c8-beeb-cccc7c1e8a9d.png",
    color: "#00E5FF",
    engine: "4.0L Boxer 6 cilindri, 510 CV",
    acceleration: "0-100 km/h in 3.4s",
    prize: "Premio esclusivo per i finalisti regionali della competizione."
  },
  {
    id: "astonmartin",
    name: "Aston Martin Vantage",
    description: "Eleganza britannica e prestazioni mozzafiato in un capolavoro di design automobilistico.",
    specs: "4.0L Twin-Turbo V8 • 503 CV • 0-100 km/h in 3.6s",
    image: "/lovable-uploads/58a727dc-f6b1-4e51-9fdb-a76260dd6607.png",
    color: "#FFFFFF",
    engine: "4.0L Twin-Turbo V8, 503 CV",
    acceleration: "0-100 km/h in 3.6s",
    prize: "Premio esclusivo per i vincitori delle sfide di eleganza."
  },
  {
    id: "ferrari",
    name: "Ferrari 488 GTB",
    description: "Eleganza dinamica e prestazioni da corsa, un simbolo dell'eccellenza automobilistica italiana.",
    specs: "3.9L V8 Twin-Turbo • 670 CV • 0-100 km/h in 3.0s",
    image: "/lovable-uploads/ef3cb1c4-5fb4-4291-8191-720d84a8e7f3.png",
    color: "#FF0000",
    engine: "3.9L V8 Twin-Turbo, 670 CV",
    acceleration: "0-100 km/h in 3.0s",
    prize: "In palio per il vincitore assoluto della competizione."
  },
  {
    id: "audi",
    name: "Audi RS7",
    description: "Tecnologia all'avanguardia e prestazioni da supercar in una berlina di straordinario lusso.",
    specs: "4.0L V8 Twin-Turbo • 600 CV • 0-100 km/h in 3.6s",
    image: "/lovable-uploads/7e65d385-baf8-446c-b320-4fc6467e3957.png",
    color: "#AAAAAA",
    engine: "4.0L V8 Twin-Turbo, 600 CV",
    acceleration: "0-100 km/h in 3.6s",
    prize: "Premio speciale per i vincitori delle sfide tecniche."
  }
];

const CarShowcase = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-play interval
  useEffect(() => {
    if (api) {
      api.on("select", () => {
        setCurrent(api.selectedScrollSnap());
        setProgressBarWidth(0); // Reset progress bar
      });
    }
    return () => {
      if (api) {
        api.off("select", () => {});
      }
    };
  }, [api]);

  // Auto-play and progress bar
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setProgressBarWidth(prev => {
        if (prev >= 100) {
          if (api) {
            api.scrollNext();
          }
          return 0;
        }
        return prev + 0.5; // Progress increment
      });
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api, current]);

  const handleShowDetails = (car: typeof LUXURY_CARS[0]) => {
    const carDetails: CarDetails = {
      id: car.id,
      name: car.name,
      description: car.description,
      engine: car.engine,
      acceleration: car.acceleration,
      prize: car.prize,
      imageUrl: car.image,
      color: car.color
    };
    
    setSelectedCar(carDetails);
    setIsModalOpen(true);
  };

  return (
    <section className="min-h-screen relative py-16 md:py-24" data-scroll-section>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-[#06071b] to-black opacity-80"></div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-4">
        <AnimatedSection className="text-center mb-10" delay={0.1} once>
          <h2 className="text-4xl md:text-5xl font-orbitron font-light mb-4">
            <span className="text-white/80">Auto di lusso</span> <span className="text-yellow-400">in palio</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Ogni mese, una nuova auto sportiva esclusiva può diventare tua. Partecipa alla sfida e scopri il potere della velocità.
          </p>
        </AnimatedSection>
        
        <div className="h-[70vh] md:h-[80vh] mt-10 overflow-hidden relative">
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-full">
              {LUXURY_CARS.map((car, index) => (
                <CarouselItem key={car.id} className="h-full">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    {/* Car Image with Parallax */}
                    <div className="absolute inset-0">
                      <ParallaxImage 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-full"
                        imageClassName="w-full h-full object-cover" 
                        speed={0.15}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    </div>
                    
                    {/* Car Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: current === index ? 1 : 0, y: current === index ? 0 : 40 }}
                        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                      >
                        <h3 className="text-4xl md:text-6xl font-orbitron font-bold mb-4" style={{ color: car.color }}>
                          {car.name}
                        </h3>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-4">
                          {car.description}
                        </p>
                        <div className="py-2 px-4 bg-black/50 inline-block rounded-full text-sm md:text-base text-white/70 mb-6">
                          {car.specs}
                        </div>
                        
                        <MagneticButton 
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 text-white flex items-center gap-2 hover:bg-white/20 transition-all duration-300 group"
                          strength={20}
                          onClick={() => handleShowDetails(car)}
                        >
                          <Info className="w-5 h-5" />
                          <span>Scopri di più</span>
                          <span className="w-0 overflow-hidden group-hover:w-[60px] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
                            su questa auto
                          </span>
                        </MagneticButton>
                      </motion.div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="absolute left-4 top-1/2 z-20 bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white h-12 w-12" />
            <CarouselNext className="absolute right-4 top-1/2 z-20 bg-black/30 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white h-12 w-12" />
          </Carousel>
          
          {/* Navigation indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {LUXURY_CARS.map((_, idx) => (
              <button 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${current === idx ? 'w-8 bg-white' : 'bg-white/40'}`}
                onClick={() => api?.scrollTo(idx)}
              />
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white"
              style={{ width: `${progressBarWidth}%`, transition: 'width 0.1s linear' }}
            />
          </div>
        </div>
      </div>

      {/* Car details modal */}
      <CarDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={selectedCar}
      />
    </section>
  );
};

export default CarShowcase;
