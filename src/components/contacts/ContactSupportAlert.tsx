
import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";

const ContactSupportAlert = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-8"
    >
      <Alert className="glass-medium glow-border-cyan">
        <Check className="h-4 w-4 text-cyan-400" />
        <AlertTitle className="neon-text-cyan">Orari di assistenza</AlertTitle>
        <AlertDescription className="text-white/80">
          Siamo disponibili dal lunedì al venerdì, dalle 9:00 alle 18:00.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default ContactSupportAlert;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
