
import React from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

interface FormContainerProps {
  className?: string;
  id?: string; // Added id prop
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ className, id, children }) => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-blue-900/20 to-black">
      <motion.div 
        id={id} // Using the id prop
        className={`max-w-4xl mx-auto glass-card p-8 sm:p-10 relative overflow-hidden ${className || ""}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#FF00FF] to-[#FFC107]"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF00FF]/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Icon and text */}
          <div className="md:w-1/2">
            <div className="mb-6 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
              <UserPlus className="text-[#00E5FF] h-8 w-8" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Diventa un <span className="text-[#00E5FF]">agente</span> di <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>
            </h2>
            
            <p className="text-white/70 mb-4">
              I primi 100 iscritti riceveranno <span className="text-yellow-300">100 crediti</span> da utilizzare per 
              le missioni al lancio di M1SSION.
            </p>
            
            <p className="text-white/70 mb-6">
              <span className="font-semibold text-cyan-400">Bonus extra:</span> Invita 3 amici attraverso il tasto "Invita un amico" 
              e guadagna <span className="text-yellow-300">50 crediti</span> per ogni amico che si pre-iscriverà con il tuo codice.
            </p>
            
            <ul className="text-white/70 space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Ricevi aggiornamenti esclusivi prima del lancio</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Accedi a contenuti e indizi in anteprima</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Sblocca vantaggi esclusivi per iniziare la sfida</span>
              </li>
            </ul>
          </div>
          
          {/* Form content will be injected here */}
          <div className="md:w-1/2 w-full">
            {children}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default FormContainer;
