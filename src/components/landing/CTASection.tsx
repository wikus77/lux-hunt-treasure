import { motion } from "framer-motion";

interface CTASectionProps {
  onRegisterClick: () => void;
  countdownCompleted?: boolean;
}

const CTASection = ({ onRegisterClick, countdownCompleted = false }: CTASectionProps) => {
  const handleRegisterClick = () => {
    const preRegistrationSection = document.getElementById('pre-registration-form');
    if (preRegistrationSection) {
      preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.section 
      className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-blue-900/20 to-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
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
          Unisciti a noi e inizia l'avventura! Registrati per essere il primo a sapere quando inizia M1SSION!
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true }}
        >
          <button 
            onClick={handleRegisterClick}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          >
            REGISTRATI ORA
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTASection;
