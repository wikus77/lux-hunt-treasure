
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePreRegistration } from './pre-registration/usePreRegistration';
import { RegistrationForm } from './pre-registration/RegistrationForm';
import SuccessView from './pre-registration/SuccessView';

interface PreRegistrationFormProps {
  countdownCompleted?: boolean;
}

const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({ 
  countdownCompleted = false 
}) => {
  const {
    formData,
    isSubmitting,
    isSuccess,
    error,
    referralCode,
    handleInputChange,
    handleSubmit,
    resetForm
  } = usePreRegistration();

  if (isSuccess) {
    return (
      <SuccessView 
        referralCode={referralCode} 
        onReset={resetForm}
      />
    );
  }

  return (
    <section 
      id="pre-registration-form" 
      className="relative py-16 px-4 overflow-hidden bg-gradient-to-b from-purple-900/20 to-black"
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${Math.random() * 200 + 30}px`,
              height: `${Math.random() * 200 + 30}px`,
              background: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#8A2BE2" : "#FF0080",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(30px)",
              animation: `pulse ${Math.random() * 8 + 8}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-2xl mx-auto relative z-10 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6 text-white"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Registrati per <br />
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] text-transparent bg-clip-text">
            M1SSION™
          </span>
        </motion.h2>
        
        <motion.p
          className="text-lg text-white/80 mb-8"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Ottieni accesso esclusivo e un codice referral unico. 
          Preparati per l'avventura che cambierà tutto.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <RegistrationForm
            formData={formData}
            isSubmitting={isSubmitting}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            countdownCompleted={countdownCompleted}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PreRegistrationForm;
