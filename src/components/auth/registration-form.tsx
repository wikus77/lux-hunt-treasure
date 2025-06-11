
import React, { useState, useEffect } from 'react';
import { useRegistration } from '@/hooks/use-registration';
import { Mail, User, Lock } from 'lucide-react';
import FormField from './form-field';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  missionPreference: 'uomo' | 'donna' | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ missionPreference }) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit: originalHandleSubmit
  } = useRegistration();

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🔍 SUBMIT CLICKED - NO CAPTCHA REQUIRED');
    console.log('📝 Form data:', { email: formData.email, missionPreference });
    
    // Submit WITHOUT any captcha token - completely removed
    originalHandleSubmit(e, 'BYPASS_COMPLETELY_DISABLED', missionPreference);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <FormField
        id="name"
        type="text"
        label="Nome"
        placeholder="Inserisci il tuo nome"
        value={formData.name}
        onChange={handleChange}
        icon={<User className="h-4 w-4" />}
        error={errors.name}
      />

      {/* Email */}
      <FormField
        id="email"
        type="email"
        label="Email"
        placeholder="Inserisci la tua email"
        value={formData.email}
        onChange={handleChange}
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
      />

      {/* Password */}
      <FormField
        id="password"
        type="password"
        label="Password"
        placeholder="Crea una password sicura"
        value={formData.password}
        onChange={handleChange}
        icon={<Lock className="h-4 w-4" />}
        error={errors.password}
      />

      {/* Conferma Password */}
      <FormField
        id="confirmPassword"
        type="password"
        label="Conferma Password"
        placeholder="Ripeti la tua password"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword}
      />

      {/* Bottone invio */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {'Registrazione in corso...'}
            </>
          ) : 'Registrati'}
        </Button>
      </motion.div>
    </form>
  );
};

export default RegistrationForm;
