import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

export function MindsetMicroTest() {
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showContinue, setShowContinue] = useState(false);

  const options = [
    "Seguire la massa",
    "Comprare indizi a caso",
    "Collegare segnali"
  ];

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return; // Already selected
    setSelectedOption(index);
    
    // Dispatch tracking event (lightweight, no external libs)
    window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
      detail: { action: "landing_minitest_choice", choice: options[index] } 
    }));
    
    // Show "Continua" after 2.5s
    setTimeout(() => {
      setShowContinue(true);
    }, 2500);
  };
  
  // Result based on choice
  const isCorrectChoice = selectedOption === 2;

  const handleContinue = () => {
    // Navigate to registration (uses existing route, no auth logic touched)
    setLocation('/register');
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <div className="glass-container p-5 md:p-6 relative overflow-hidden border border-cyan-500/20">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10">
          {/* Title */}
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">
            TEST RAPIDO: VEDI IL PATTERN? <span className="text-white/50">(10s)</span>
          </p>
          
          {/* Subtitle */}
          <p className="text-white/50 text-xs mb-3 text-center">
            Scegli la risposta più logica. 1 click.
          </p>
          
          {/* Question - implicit in options */}
          
          {/* Options */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={selectedOption !== null}
                className={`
                  flex-1 px-3 py-2.5 rounded-full text-xs md:text-sm font-medium
                  border transition-all duration-300
                  ${selectedOption === index 
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                    : selectedOption !== null
                      ? 'border-white/10 text-white/30 cursor-not-allowed'
                      : 'border-white/20 text-white/80 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
          
          {/* Result message */}
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {isCorrectChoice ? (
                <p className="text-green-400 text-xs md:text-sm font-semibold mb-1">
                  ✅ Sei un candidato. Il sistema ti riconosce.
                </p>
              ) : (
                <p className="text-yellow-400/80 text-xs md:text-sm mb-1">
                  ⚠️ Il sistema registra il rumore. Riprova.
                </p>
              )}
              
              {/* Microcopy */}
              <p className="text-white/50 text-xs">
                M1SSION premia chi capisce.
              </p>
              
              {/* Continue button to registration */}
              {showContinue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <p className="text-green-400/80 text-xs mb-3">Ora puoi entrare.</p>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300"
                    aria-label="Continua alla registrazione"
                  >
                    CONTINUA →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MindsetMicroTest;


