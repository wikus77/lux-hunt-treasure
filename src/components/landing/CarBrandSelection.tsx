
import React, { useState, useEffect } from "react";
import { luxuryCarsData } from "@/data/luxuryCarsData";
import { LazyImage } from "@/components/ui/lazy-image";
import { motion } from "framer-motion";

const CarBrandSelection = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<string | null>(null);

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
    setIsRotating(brandId);
    setTimeout(() => {
      setSelectedBrand(brandId === selectedBrand ? null : brandId);
    }, 500);
  };

  const selectedCar = selectedBrand 
    ? luxuryCarsData.find(car => car.id === selectedBrand) 
    : null;

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-black to-m1ssion-deep-blue">
      <div className="container px-4 mx-auto">
        <motion.h2 
          className="text-center text-3xl md:text-5xl font-orbitron mb-6 gradient-text-multi"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Vuoi provarci? Fallo. Ma fallo per vincere.
        </motion.h2>
        
        <motion.p 
          className="text-center text-gray-300 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Seleziona il tuo brand preferito e scopri la tua auto!
        </motion.p>
        
        {/* Brand Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center mb-12">
          {luxuryCarsData.map((car) => (
            <motion.div
              key={car.id}
              className={`relative group cursor-pointer ${car.id}-logo-container car-logo-container glass-card p-3`}
              onClick={() => handleBrandClick(car.id)}
              whileHover={{ scale: 1.1, rotate: 5, y: -10 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: isRotating === car.id ? 360 : 0,
                transition: { 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  duration: isRotating === car.id ? 1 : 0.3
                }
              }}
              transition={{
                duration: 0.3,
                delay: luxuryCarsData.indexOf(car) * 0.1
              }}
            >
              <LazyImage
                src={car.logo}
                alt={car.brand}
                className={`car-logo transition-all duration-300 ${selectedBrand === car.id ? 'scale-110' : ''}`}
              />
              
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 text-xs text-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: selectedBrand === car.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {car.brand}
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Selected Car Preview */}
        <div className="mt-12 relative min-h-[300px]">
          {selectedCar && (
            <motion.div 
              className="glass-card p-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <LazyImage 
                      src={selectedCar.imageUrl} 
                      alt={selectedCar.name}
                      className="max-h-[250px] object-contain rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
                
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h3 className="text-2xl font-orbitron mb-2 gradient-text-cyan">{selectedCar.name}</h3>
                    <p className="text-gray-300 mb-4">{selectedCar.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-400 w-28">Motore:</span>
                        <span className="text-white">{selectedCar.engine}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 w-28">Accelerazione:</span>
                        <span className="text-white">{selectedCar.acceleration}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="text-m1ssion-blue font-semibold">{selectedCar.prize}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
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
        </div>
      </div>
    </section>
  );
};

export default CarBrandSelection;
