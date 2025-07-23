// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { usePreRegistration } from '../landing/pre-registration/usePreRegistration';
import SuccessView from '../landing/pre-registration/SuccessView';

interface PreRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const {
    formData,
    isSubmitting,
    isSuccess,
    error,
    referralCode,
    agentCode,
    needsEmailVerification,
    userCredentials,
    handleInputChange,
    handleSubmit,
    resetForm
  } = usePreRegistration();

  console.log('🖥️ Modal PreRegistrationForm render:', { 
    isSuccess, 
    agentCode, 
    referralCode, 
    userCredentials,
    needsEmailVerification
  });

  if (isSuccess) {
    console.log('✅ Modal: Rendering SuccessView with:', { referralCode, agentCode, userCredentials });
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-2xl bg-black/90 border border-cyan-500/30 rounded-xl p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <SuccessView 
            referralCode={referralCode}
            agentCode={agentCode}
            needsEmailVerification={needsEmailVerification}
            userCredentials={userCredentials}
            onReset={() => {
              resetForm();
              onCancel?.();
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-black/90 border border-cyan-500/30 rounded-xl p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            <span className="text-cyan-400">PRE-REGISTRAZIONE</span> M1SSION™
          </h2>
          <p className="text-gray-400 text-sm">
            Registrati ora per essere pronto al lancio del 19 Agosto 2025
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nome completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="bg-black/50 border-gray-600 text-white"
              placeholder="Inserisci il tuo nome"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-black/50 border-gray-600 text-white"
              placeholder="la-tua-email@esempio.com"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
            >
              {isSubmitting ? 'Registrazione...' : 'PRE-REGISTRATI ORA'}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            La missione inizierà il 19 Agosto 2025 alle 07:00 (UTC+2)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};