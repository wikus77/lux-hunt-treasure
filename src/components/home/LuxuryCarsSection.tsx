
import React from 'react';
import { motion } from 'framer-motion';
import { Car, Star, ArrowRight } from 'lucide-react';

const LuxuryCarsSection = () => {
  const luxuryCars = [
    {
      id: 1,
      name: "Porsche 911 GT3 RS",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
      price: "€ 220.000",
      description: "Prestazioni da pista per l'uso stradale",
      specs: ["510 HP", "0-100 in 3.2s", "318 km/h"],
      rarity: "ULTRA RARE"
    },
    {
      id: 2,
      name: "Ferrari 488 Pista",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
      price: "€ 350.000",
      description: "L'evoluzione estrema della 488",
      specs: ["720 HP", "0-100 in 2.85s", "340 km/h"],
      rarity: "LEGENDARY"
    },
    {
      id: 3,
      name: "McLaren 720S",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
      price: "€ 280.000",
      description: "Velocità supersonica su strada",
      specs: ["710 HP", "0-100 in 2.9s", "341 km/h"],
      rarity: "EPIC"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return "text-orange-400 bg-orange-400/20 border-orange-400/50";
      case "ULTRA RARE":
        return "text-purple-400 bg-purple-400/20 border-purple-400/50";
      case "EPIC":
        return "text-cyan-400 bg-cyan-400/20 border-cyan-400/50";
      default:
        return "text-white bg-white/20 border-white/50";
    }
  };

  return (
    <motion.section 
      className="py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Car className="w-8 h-8 text-cyan-400" />
          <h2 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            LUXURY COLLECTION
          </h2>
        </div>
        <p className="text-lg text-white/70 font-orbitron max-w-2xl mx-auto">
          I premi automobilistici più esclusivi del programma M1SSION™
        </p>
      </motion.div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {luxuryCars.map((car, index) => (
          <motion.div
            key={car.id}
            className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl border border-cyan-400/30 overflow-hidden hover:border-cyan-400/60 transition-all duration-500"
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 209, 255, 0.1)"
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 209, 255, 0.3)"
            }}
          >
            {/* Rarity Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold border ${getRarityColor(car.rarity)}`}>
                {car.rarity}
              </span>
            </div>

            {/* Car Image */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={car.image} 
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Price Overlay */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-black/80 backdrop-blur-sm text-yellow-400 font-orbitron font-bold px-3 py-2 rounded-lg border border-yellow-400/30">
                  {car.price}
                </span>
              </div>
            </div>

            {/* Car Details */}
            <div className="p-6">
              <h3 className="text-xl font-orbitron font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {car.name}
              </h3>
              
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {car.description}
              </p>

              {/* Specifications */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {car.specs.map((spec, specIndex) => (
                  <div key={specIndex} className="bg-black/30 rounded-lg p-2 text-center border border-white/10">
                    <span className="text-xs font-orbitron text-cyan-400 font-bold">
                      {spec}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-orbitron font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>DETTAGLI PREMIO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.button
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-orbitron font-bold py-4 px-8 rounded-full hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-3">
            <Car className="w-5 h-5" />
            <span>ESPLORA TUTTI I PREMI</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default LuxuryCarsSection;
