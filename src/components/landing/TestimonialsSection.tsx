
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Marco R.",
    title: "Vincitore Aprile 2025",
    quote: "Non avrei mai pensato di vincere una Ferrari. La caccia al tesoro è stata estremamente avvincente e ho fatto nuove amicizie durante la ricerca degli indizi.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    stars: 5
  },
  {
    name: "Sofia T.",
    title: "Finalista Marzo 2025",
    quote: "Anche se non ho vinto, l'esperienza è stata incredibile. Gli indizi erano intelligenti e stimolanti. Non vedo l'ora della prossima edizione!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    stars: 5
  },
  {
    name: "Alessandro G.",
    title: "Vincitore Febbraio 2025",
    quote: "La Lamborghini che ho vinto ha cambiato la mia vita. La caccia è stata impegnativa ma entusiasmante. Team M1SSION, siete fantastici!",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    stars: 5
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Decorative particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(2px)"
            }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 15, 30, 15, 0],
              scale: [1, 1.2, 1, 0.8, 1],
              opacity: [0.4, 0.7, 0.4, 0.7, 0.4],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              ease: "easeInOut",
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-yellow-400 mb-2 text-lg font-light tracking-wider uppercase">Testimonianze</h2>
          <h3 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-multi mb-6">I Nostri Vincitori</h3>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Scopri le storie di chi ha partecipato e vinto le nostre cacce al tesoro. Potrebbe essere tu il prossimo.
          </p>
        </motion.div>

        <div className="relative">
          {/* Testimonial Slider */}
          <div className="relative h-[26rem] max-w-3xl mx-auto glass-card p-8 bg-black/60">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className={`absolute inset-0 flex flex-col justify-center items-center p-8 text-center`}
                initial={{ opacity: 0, x: idx > currentIndex ? 100 : -100 }}
                animate={{ 
                  opacity: idx === currentIndex ? 1 : 0,
                  x: idx === currentIndex ? 0 : idx > currentIndex ? 100 : -100,
                  zIndex: idx === currentIndex ? 10 : 0
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-xl text-white/90 italic mb-6">"{testimonial.quote}"</p>
                
                <h4 className="text-2xl font-bold text-white mb-1">{testimonial.name}</h4>
                <p className="text-cyan-400">{testimonial.title}</p>
              </motion.div>
            ))}

            {/* Navigation buttons */}
            <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-yellow-400" : "bg-white/30"
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
