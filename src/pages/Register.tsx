
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import BackgroundParticles from "@/components/ui/background-particles";
import RegistrationForm from "@/components/auth/registration-form";
import RegisterHeader from "@/components/auth/register-header";

const Register = () => {
  const { toast: useToastHook } = useToast();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background particles */}
      <BackgroundParticles count={15} />

      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with logo */}
        <RegisterHeader />

        {/* Registration form */}
        <RegistrationForm />

        {/* Terms and conditions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            Registrandoti accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
