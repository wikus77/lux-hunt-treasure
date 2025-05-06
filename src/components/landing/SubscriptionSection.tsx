
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SubscriptionBenefits } from "@/components/subscription/SubscriptionBenefits";
import { useState } from "react";

const SubscriptionSection = () => {
  const [selectedSubscription, setSelectedSubscription] = useState("Base");

  return (
    <section className="w-full py-16 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute left-0 top-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute right-10 bottom-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
            <span className="text-cyan-400">Piani di </span>Abbonamento
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Scegli il piano più adatto alle tue esigenze. Inizia gratuitamente o potenzia la tua esperienza con i piani premium.
          </p>
        </motion.div>

        {/* Free Subscription Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SubscriptionBenefits />
        </motion.div>

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <SubscriptionPlans 
            selected={selectedSubscription}
            setSelected={setSelectedSubscription}
          />
        </motion.div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            variant="default" 
            size="lg" 
            className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 text-black font-bold px-8 py-6 rounded-full text-lg hover:shadow-[0_0_25px_rgba(0,229,255,0.7)]"
          >
            INIZIA SUBITO
          </Button>
          <p className="text-gray-400 mt-4 text-sm">
            Puoi cambiare o cancellare il tuo abbonamento in qualsiasi momento
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
