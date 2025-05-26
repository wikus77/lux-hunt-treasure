
import { motion } from "framer-motion";

interface CTASectionProps {
  onRegisterClick: () => void;
  countdownCompleted?: boolean;
}

const CTASection = ({ onRegisterClick, countdownCompleted = false }: CTASectionProps) => {
  const handleRegisterClick = () => {
    // Sempre scorrere fino al form di registrazione, indipendentemente dallo stato del countdown
    const preRegistrationSection = document.getElementById('pre-registration-form');
    if (preRegistrationSection) {
      preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback al handler originale
      onRegisterClick();
    }
  };

  return (
    <motion.section 
      className="relative py-16 px-4 overflow-hidden bg-gradient-to-b from-blue-900/20 to-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      data-parallax="scroll"
    >
      {/* Animated background elements with parallax effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            data-parallax="background"
            data-parallax-speed={`-${0.2 + (i % 5) * 0.08}`}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#8A2BE2" : "#FF0080",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(40px)",
              transform: `scale(${Math.random() * 1 + 0.5})`,
              animation: `pulse ${Math.random() * 10 + 10}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6 text-white"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          data-parallax="scroll"
          data-parallax-speed="0.2"
        >
          Preparati per la <br />
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] text-transparent bg-clip-text">Missione di una vita</span>
        </motion.h2>
        
        <motion.p
          className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          data-parallax="scroll"
          data-parallax-speed="0.15"
        >
          Unisciti a noi e inizia l'avventura! Registrati per essere il primo a sapere quando inizia <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>!
        </motion.p>
        
        <motion.button
          className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all duration-300"
          onClick={handleRegisterClick}
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          data-parallax="scroll"
          data-parallax-speed="0.3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          REGISTRATI ORA
        </motion.button>
      </div>
    </motion.section>
  );
};

export default CTASection;
