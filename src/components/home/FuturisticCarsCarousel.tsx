import { useState } from "react";
import { motion } from "framer-motion";
import { CirclePlay } from "lucide-react";
import { CarDetailsModal, CarDetails } from "@/components/home/CarDetailsModal";
import ImagePreview from "@/components/ui/image-preview";
import { useLongPress } from "@/hooks/useLongPress";

const cars = [
  {
    id: "ferrari",
    name: "Ferrari SF90 Stradale",
    image: "/lovable-uploads/b9b5db19-1879-4050-866e-6cb044f50764.png", // Updated Ferrari image
    description: "Un motore da sogno, una missione da conquistare",
    trailer: "https://www.youtube.com/watch?v=UAO2urG23S4",
    engine: "3.9L V8 Twin-Turbo, 670 CV",
    acceleration: "0-100 km/h in 3.0s",
    prize: "In palio per il vincitore assoluto della competizione.",
    imageUrl: "/lovable-uploads/b9b5db19-1879-4050-866e-6cb044f50764.png" // Updated Ferrari image
  },
  {
    id: "mercedes",
    name: "Mercedes AMG GT",
    image: "/lovable-uploads/b96df1db-6d05-4203-8811-d6770bd46b6d.png",
    description: "Eleganza tedesca e potenza senza compromessi",
    trailer: "https://www.youtube.com/watch?v=vtBrewMd2bU",
    engine: "V8 Biturbo, 730 CV",
    acceleration: "0-100 km/h in 3,2s",
    prize: "Premio speciale per il secondo classificato nella competizione nazionale.",
    imageUrl: "/lovable-uploads/f6925d8d-955c-4883-be54-6e6165691443.png"
  },
  {
    id: "porsche",
    name: "Porsche 911",
    image: "/lovable-uploads/54cd25b0-fa7b-44c9-b7b6-d69dcc09df92.png",
    description: "Precisione tedesca, premio esclusivo",
    trailer: "https://www.youtube.com/watch?v=OQe58UZAPdU",
    engine: "4.0L Boxer 6 cilindri, 510 CV",
    acceleration: "0-100 km/h in 3.4s",
    prize: "Premio esclusivo per i finalisti regionali della competizione.",
    imageUrl: "/public/events/porsche-911.jpg"
  },
  {
    id: "lamborghini",
    name: "Lamborghini Huracán",
    image: "/lovable-uploads/794fb55d-30c8-462e-81e7-e72cc89815d4.png",
    description: "Potenza e stile, sfida senza limiti",
    trailer: null,
    engine: "V10 5.2L, 640 CV",
    acceleration: "0-100 km/h in 2.9s",
    prize: "Premio speciale per i vincitori delle sfide di abilità.",
    imageUrl: "/public/events/lamborghini-huracan.jpg"
  },
  {
    id: "mclaren",
    name: "McLaren 720S",
    image: "/lovable-uploads/6df12de9-c68f-493b-ac32-4dd934ed79a2.png",
    description: "Tecnologia da Formula 1 su strada",
    trailer: null,
    engine: "V8 4.0L Twin-Turbo, 720 CV",
    acceleration: "0-100 km/h in 2,8s",
    prize: "Premio esclusivo per i vincitori delle sfide tecniche a tempo.",
    imageUrl: "/public/events/tesla-model-s.jpg"
  },
  {
    id: "astonmartin",
    name: "Aston Martin",
    image: "/lovable-uploads/c52a635b-2c3c-4c4c-8dcf-c83776fea9d8.png",
    description: "L'eleganza britannica in ogni curva",
    trailer: null,
    engine: "V12 6.5L + sistema ibrido, 1160 CV",
    acceleration: "0-100 km/h in 2,5s",
    prize: "Premio speciale limitato per i vincitori della competizione internazionale.",
    imageUrl: "/public/events/ferrari-sf90.jpg"
  }
];

export default function FuturisticCarsCarousel() {
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCarClick = (car: typeof cars[0]) => {
    if (car.trailer) {
      window.open(car.trailer, '_blank');
      return;
    }
    
    const carDetails: CarDetails = {
      id: car.id,
      name: car.name,
      description: car.description,
      engine: car.engine,
      acceleration: car.acceleration,
      prize: car.prize,
      imageUrl: car.imageUrl,
      color: car.id === "ferrari" ? "#FF0000" : 
             car.id === "mercedes" ? "#00D2FF" :
             car.id === "porsche" ? "#FFDA00" :
             car.id === "lamborghini" ? "#FFC107" :
             car.id === "mclaren" ? "#FF5500" : "#FFD700"
    };
    
    setSelectedCar(carDetails);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full relative">
      <div className="flex gap-5 overflow-x-auto py-2 px-1 scrollbar-none">
        {cars.map((car, idx) => {
          const longPressProps = useLongPress(() => setPreviewImage(car.image));
          
          return (
            <motion.div
              key={car.name}
              className="min-w-[260px] max-w-[340px] group relative rounded-xl overflow-hidden shadow-xl border-4 border-cyan-400/80 bg-gradient-to-br from-black/90 to-cyan-900/50 cursor-pointer hover:scale-105 transition-all neon-border"
              style={{
                boxShadow: "0 0 32px 2px #00e5ff99"
              }}
              onClick={() => handleCarClick(car)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 * idx }}
              whileHover={{ scale: 1.08 }}
            >
              {/* Parallax Glow Effect */}
              <div
                {...longPressProps}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(car.image);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPreviewImage(car.image);
                }}
              >
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-40 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                  style={{
                    filter: "drop-shadow(0 0 32px #00e5ffcf)",
                    transform: "perspective(600px) rotateY(4deg)"
                  }}
                />
              </div>
              
              {/* Animated car description */}
              <motion.div
                className="absolute bottom-0 w-full px-3 py-1.5 bg-gradient-to-t from-black/90 to-cyan-900/30"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + 0.07 * idx }}
              >
                <span className="block text-lg text-cyan-300 font-bold animate-fade-in">{car.name}</span>
                <span className="block text-white/90 text-sm italic animate-fade-in">{car.description}</span>
                <span className="inline-flex items-center gap-1 text-xs text-cyan-100 mt-1">
                  <CirclePlay className="w-3 h-3 inline" /> {car.trailer ? "Guarda il trailer" : "Scopri di più"}
                </span>
              </motion.div>
              
              {/* Glow Border */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 rounded-xl border-4 border-cyan-400 neon-border animate-neon-pulse" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Car details modal */}
      <CarDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={selectedCar}
      />
      
      {/* Image preview modal */}
      <ImagePreview 
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ""}
        alt="Car preview"
      />
    </div>
  );
}
