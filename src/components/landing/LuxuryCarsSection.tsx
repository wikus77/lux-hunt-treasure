
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { luxuryCarsData } from "@/data/luxuryCarsData";
import { CarDetailsModal, CarDetails } from "@/components/home/CarDetailsModal";

const LuxuryCarsSection = () => {
  // State for tracking which images have been loaded with success
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageLoad = (brand: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [brand]: true
    }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, car: typeof luxuryCarsData[0]) => {
    console.error(`Failed to load image: ${car.logo}`);
    
    // Fallback with colored background and brand name
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background with brand color
      ctx.fillStyle = car.color;
      ctx.fillRect(0, 0, 200, 200);
      
      // Brand name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(car.brand, 100, 100);
    }
    e.currentTarget.src = canvas.toDataURL();
  };

  const openCarDetails = (car: typeof luxuryCarsData[0]) => {
    const carDetails: CarDetails = {
      id: car.id,
      name: car.name,
      description: car.description,
      engine: car.engine,
      acceleration: car.acceleration,
      prize: car.prize,
      imageUrl: car.imageUrl || '/lovable-uploads/14f94617-e821-4a59-9b90-32d1dfd615e4.png',
      color: car.color
    };
    
    setSelectedCar(carDetails);
    setIsModalOpen(true);
  };

  // Responsive design: use carousel on mobile and grid on desktop
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth > 768 : false;

  return (
    <motion.section 
      className="py-20 px-4 bg-black w-full max-w-screen-xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <motion.h2 
        className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[#FF0000] to-[#FF6B00] bg-clip-text text-transparent"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Fallo ora, Fallo meglio di tutti
      </motion.h2>

      <motion.p 
        className="text-center max-w-2xl mx-auto mb-8 text-white/70"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
      >
        Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>, dove M1 è in celeste e SSION in bianco
      </motion.p>

      {isDesktop ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-8 w-full">
          {luxuryCarsData.map((car, index) => (
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
                
                <p className="text-sm text-white/70 text-center mb-4">
                  {car.shortDescription}
                </p>
                
                <Badge 
                  className="mt-4 bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm cursor-pointer"
                  onClick={() => openCarDetails(car)}
                >
                  Scopri di più
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent>
            {luxuryCarsData.map((car, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  className="glass-card hover:bg-white/10 transition-all relative overflow-hidden group p-6 h-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
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
                          <div className="w-12 h-12 border-4 border-t-transparent border-red-400 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-center" style={{ color: car.color }}>{car.brand}</h3>
                    
                    <p className="text-sm text-white/70 text-center mb-4">
                      {car.shortDescription}
                    </p>
                    
                    <Badge 
                      className="bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm cursor-pointer"
                      onClick={() => openCarDetails(car)}
                    >
                      Scopri di più
                    </Badge>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
      
      {/* Car details modal - Updated to show the new Ferrari image */}
      <CarDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={selectedCar}
      />
    </motion.section>
  );
};

export default LuxuryCarsSection;
