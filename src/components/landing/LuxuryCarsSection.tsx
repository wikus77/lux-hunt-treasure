
import { motion } from "framer-motion";
import { Car } from "lucide-react";

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
          { brand: 'Ferrari', color: '#FF0000', icon: <Car /> },
          { brand: 'Lamborghini', color: '#FFC107', icon: <Car /> },
          { brand: 'Porsche', color: '#00E5FF', icon: <Car /> },
          { brand: 'Tesla', color: '#FFFFFF', icon: <Car /> }
        ].map((car, index) => (
          <motion.div 
            key={index}
            className="glass-card hover:bg-white/10 transition-all relative overflow-hidden group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity" style={{ color: car.color }}>
              {car.icon}
              <Car size={80} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: car.color }}>{car.brand}</h3>
            <p className="text-sm text-white/70 relative z-10">
              Una delle auto più prestigiose al mondo potrebbe essere tua.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default LuxuryCarsSection;
