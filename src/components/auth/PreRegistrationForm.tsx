// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface PreRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PreRegistrationForm: React.FC<PreRegistrationFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non corrispondono');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user account with email verification
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/how-it-works`,
          data: {
            email_confirm: true
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Store in pre_registered_users table for tracking
        await supabase
          .from('pre_registered_users')
          .insert({
            email: formData.email,
            password_hash: 'handled_by_supabase_auth',
            is_verified: false
          });

        toast.success('Pre-registrazione completata!', {
          description: '📧 Controlla la tua email per completare la verifica dell\'indirizzo e attivare il tuo Codice Agente personale.'
        });
      } else {
        toast.success('Pre-registrazione completata!', {
          description: 'Accesso disponibile dal 19 Agosto 2025.'
        });
      }

      onSuccess?.();
      
    } catch (error: any) {
      console.error('Pre-registration error:', error);
      toast.error(error.message || 'Errore durante la pre-registrazione');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-black/50 border-gray-600 text-white"
              placeholder="la-tua-email@esempio.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="bg-black/50 border-gray-600 text-white"
              placeholder="Almeno 6 caratteri"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength={6}
              className="bg-black/50 border-gray-600 text-white"
              placeholder="Ripeti la password"
            />
          </div>

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
              disabled={isSubmitting}
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