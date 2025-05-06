
import React, { useState, useEffect } from "react";
import { luxuryCarsData } from "@/data/luxuryCarsData";
import { LazyImage } from "@/components/ui/lazy-image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CarBrandSelection = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // Assicuriamoci che il componente sia montato correttamente
  useEffect(() => {
    try {
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading CarBrandSelection:", error);
      setLoadingError(true);
    }
  }, []);

  // Reset rotation state after animation completes
  useEffect(() => {
    if (isRotating) {
      const timer = setTimeout(() => {
        setIsRotating(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRotating]);

  const handleBrandClick = (brandId: string) => {
    try {
      setIsRotating(brandId);
      setTimeout(() => {
        setSelectedBrand(brandId === selectedBrand ? null : brandId);
      }, 300);
    } catch (error) {
      console.error("Error handling brand click:", error);
    }
  };

  const selectedCar = selectedBrand 
    ? luxuryCarsData.find(car => car.id === selectedBrand) 
    : null;

  // Mostro un fallback in caso di errori
  if (loadingError) {
    return (
      <div className="py-12 text-center text-red-400">
        Impossibile caricare la selezione auto.
        <button 
          onClick={() => window.location.reload()}
          className="mx-auto mt-4 block px-4 py-2 bg-black/40 border border-cyan-500/50 text-cyan-400 hover:bg-black/60"
        >
          Ricarica pagina
        </button>
      </div>
    );
  }

  // Mostro un indicatore di caricamento se necessario
  if (!isLoaded) {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        <div className="mt-4 text-cyan-300">Caricamento selezione auto...</div>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Background grid lines effect */}
        <div className="absolute inset-0 z-0">
          <div className="grid-lines"></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-12 text-center">
            <motion.div
              className="text-lg md:text-xl text-cyan-400 font-orbitron"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              SELEZIONA UN BRAND
            </motion.div>
          </div>
          
          {/* Brand Selection Grid - Large square neon outlined cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {luxuryCarsData.map((car) => (
              <motion.div
                key={car.id}
                className={`relative cursor-pointer`}
                onClick={() => handleBrandClick(car.id)}
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  rotate: isRotating === car.id ? 360 : 0,
                }}
                transition={{
                  rotate: { duration: 0.8, ease: "easeInOut" },
                  scale: { duration: 0.3 }
                }}
              >
                <div className={`aspect-square rounded-2xl p-6 flex items-center justify-center
                  ${selectedBrand === car.id ? 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.7)]' : 'border border-cyan-400/30'}
                  bg-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]`}
                >
                  <LazyImage
                    src={car.logo}
                    alt={car.brand}
                    className={`w-4/5 h-4/5 object-contain transition-all duration-500
                      ${selectedBrand === car.id ? 'filter-none brightness-200' : 'brightness-150 filter-cyan-glow'}
                      ${isRotating === car.id ? 'scale-90' : 'scale-100'}`}
                    onError={() => console.error(`Error loading image for ${car.brand}`)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Selected Car Preview - Dark with neon highlights */}
          <motion.div 
            className="mt-8 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedCar ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {selectedCar && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <LazyImage 
                    src={selectedCar.imageUrl} 
                    alt={selectedCar.name}
                    className="w-full h-[400px] object-cover object-center rounded-t-3xl"
                    onError={() => console.error(`Error loading image for ${selectedCar.name}`)}
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                    <h3 className="text-2xl font-orbitron mb-2 text-cyan-400">{selectedCar.name}</h3>
                    <p className="text-gray-300 mb-4 max-w-3xl">{selectedCar.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-6">
                      <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                        <span className="text-gray-400 mr-2">Motore:</span>
                        <span className="text-white">{selectedCar.engine}</span>
                      </div>
                      
                      <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30">
                        <span className="text-gray-400 mr-2">Accelerazione:</span>
                        <span className="text-white">{selectedCar.acceleration}</span>
                      </div>
                    </div>
                    
                    <div className="text-cyan-400 font-orbitron text-lg">
                      M1SSION FOREVER
                    </div>
                  </div>
                  
                  {/* Next button at bottom */}
                  <motion.div 
                    className="absolute bottom-6 right-6 z-30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer">
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            {!selectedCar && (
              <motion.div 
                className="text-center py-12 text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-lg">Seleziona un brand per visualizzare i dettagli dell'auto</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CarBrandSelection;
