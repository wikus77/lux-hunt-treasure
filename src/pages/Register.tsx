
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import BackgroundParticles from "@/components/ui/background-particles";
import RegistrationForm from "@/components/auth/registration-form";
import RegisterHeader from "@/components/auth/register-header";
import { Button } from "@/components/ui/button";

const Register = () => {
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

        {/* Terms and conditions & Login link */}
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-white/50">
            Registrandoti accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
          
          <p className="text-sm text-white/70">
            Hai già un account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Accedi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
