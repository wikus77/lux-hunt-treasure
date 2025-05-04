
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const LuxuryCarsSection = () => {
  // Define reliable car logos from public assets
  const carLogos = [
    { 
      brand: 'Ferrari', 
      color: '#FF0000', 
      logo: '/lovable-uploads/5349c240-d33e-4a10-8956-b1fe87396dbd.png',
      description: 'L\'emblema del cavallino rampante, simbolo di potenza ed eccellenza italiana.'
    },
    { 
      brand: 'Lamborghini', 
      color: '#FFC107', 
      logo: '/lovable-uploads/899aadd7-7ab5-4acc-839d-891f1ba034b3.png',
      description: 'Il toro, simbolo di forza e audacia del marchio di Sant\'Agata Bolognese.'
    },
    { 
      brand: 'Porsche', 
      color: '#00E5FF', 
      logo: 'https://cdn.freebiesupply.com/logos/large/2x/porsche-logo-png-transparent.png',
      description: 'Lo stemma di Stoccarda, sinonimo di prestazioni e precisione tedesca.'
    },
    { 
      brand: 'McLaren', 
      color: '#FF5500', 
      logo: 'https://cdn.freebiesupply.com/logos/large/2x/mclaren-logo-png-transparent.png',
      description: 'L\'eredità della Formula 1 in una supercar stradale di lusso britannica.'
    }
  ];

  // State to track which images have loaded successfully
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (brand: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [brand]: true
    }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, car: typeof carLogos[0]) => {
    console.error(`Failed to load image: ${car.logo}`);
    
    // Create a fallback with colored background and brand name
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fill with brand color
      ctx.fillStyle = car.color;
      ctx.fillRect(0, 0, 200, 200);
      
      // Add brand name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(car.brand, 100, 100);
    }
    e.currentTarget.src = canvas.toDataURL();
  };

  return (
    <motion.section 
      className="py-20 px-4 bg-black w-full max-w-screen-xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Auto di Lusso in Palio
      </motion.h2>

      <motion.p 
        className="text-center max-w-2xl mx-auto mb-12 text-white/70"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
      >
        Ogni mese, M1SSION mette in palio un'auto di lusso. Lamborghini, Ferrari, Porsche e altre auto da sogno sono pronte per essere vinte.
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {carLogos.map((car, index) => (
          <motion.div 
            key={index}
            className="glass-card hover:bg-white/10 transition-all relative overflow-hidden group p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-4 w-full aspect-square flex items-center justify-center p-4 relative">
                <img 
                  src={car.logo} 
                  alt={`${car.brand} logo`} 
                  className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-300"
                  onLoad={() => handleImageLoad(car.brand)}
                  onError={(e) => handleImageError(e, car)}
                />
                {!loadedImages[car.brand] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-center" style={{ color: car.color }}>{car.brand}</h3>
              
              <p className="text-sm text-white/70 text-center">
                {car.description}
              </p>
              
              <Badge 
                className="mt-4 bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm"
              >
                Scopri di più
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default LuxuryCarsSection;
