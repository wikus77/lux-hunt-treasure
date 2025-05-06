
import React, { useState, useEffect } from "react";
import { luxuryCarsData } from "@/data/luxuryCarsData";
import { LazyImage } from "@/components/ui/lazy-image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CarBrandSelection = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Reset rotation state after animation completes
  useEffect(() => {
    if (isRotating) {
      const timer = setTimeout(() => {
        setIsRotating(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRotating]);

  // Handle image load events
  const handleImageLoad = (brandId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [brandId]: true
    }));
  };

  const handleBrandClick = (brandId: string) => {
    setIsRotating(brandId);
    setTimeout(() => {
      setSelectedBrand(brandId === selectedBrand ? null : brandId);
    }, 300);
  };

  const selectedCar = selectedBrand 
    ? luxuryCarsData.find(car => car.id === selectedBrand) 
    : null;

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background grid lines effect */}
      <div className="absolute inset-0 z-0">
        <div className="grid-lines"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-12">
          <motion.h2 
            className="text-3xl md:text-5xl font-orbitron text-cyan-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            M1SSION
          </motion.h2>
          
          <motion.div
            className="text-lg md:text-2xl text-cyan-400 font-orbitron"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            SELECT A BRAND
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
                  onLoad={() => handleImageLoad(car.id)}
                />
                
                {/* Loading state */}
                {!imagesLoaded[car.id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                  </div>
                )}
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
                    {selectedCar.prize}
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
  );
};

export default CarBrandSelection;
