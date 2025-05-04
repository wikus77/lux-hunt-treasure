
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const LuxuryCarsSection = () => {
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
        {[
          { 
            brand: 'Ferrari', 
            color: '#FF0000', 
            logo: '/lovable-uploads/72f29ba6-d993-48a2-87ee-49f277ac4054.png',
            description: 'L\'emblema del cavallino rampante, simbolo di potenza ed eccellenza italiana.'
          },
          { 
            brand: 'Lamborghini', 
            color: '#FFC107', 
            logo: '/lovable-uploads/5cf7989e-9669-4746-b385-b1a1f71c3911.png',
            description: 'Il toro, simbolo di forza e audacia del marchio di Sant\'Agata Bolognese.'
          },
          { 
            brand: 'Porsche', 
            color: '#00E5FF', 
            logo: '/lovable-uploads/a83b5c6d-75d0-4cb1-9e13-695850f887d5.png',
            description: 'Lo stemma di Stoccarda, sinonimo di prestazioni e precisione tedesca.'
          },
          { 
            brand: 'McLaren', 
            color: '#FF5500', 
            logo: '/lovable-uploads/2b15a4d9-835b-49cd-aa61-ea0ee5cc0bcf.png',
            description: 'L\'eredità della Formula 1 in una supercar stradale di lusso britannica.'
          }
        ].map((car, index) => (
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
              <div className="mb-4 w-full aspect-square flex items-center justify-center">
                <img 
                  src={car.logo} 
                  alt={`${car.brand} logo`} 
                  className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-300"
                />
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
