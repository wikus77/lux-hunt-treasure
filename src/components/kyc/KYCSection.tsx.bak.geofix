
import React from "react";
import { motion } from "framer-motion";
import KYCForm from "./KYCForm";
import { IdCard } from "lucide-react";

const KYCSection: React.FC = () => {
  return (
    <section className="w-full px-4 py-16 bg-gradient-to-b from-black to-blue-950/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-6">
            <IdCard className="w-7 h-7 text-purple-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Verifica la tua identità
          </h2>
          
          <p className="text-white/70 max-w-2xl mx-auto">
            Per garantire un'esperienza di gioco sicura e conforme alle normative, 
            tutti i partecipanti devono completare il processo di verifica dell'identità 
            prima di poter ricevere eventuali premi.
          </p>
        </motion.div>

        <KYCForm />
      </div>
    </section>
  );
};

export default KYCSection;
