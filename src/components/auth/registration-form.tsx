// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 VISUAL ALIGNMENT: Matches LoginPage form styling

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistration } from '@/hooks/use-registration';
import { Mail, User, Lock, ArrowRight } from 'lucide-react';
import FormField from './form-field';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RegistrationFormProps {
  missionPreference: 'uomo' | 'donna' | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ missionPreference }) => {
  const { t } = useTranslation();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit: originalHandleSubmit
  } = useRegistration();

  const handleSubmit = (e: React.FormEvent) => {
    // Submit WITHOUT any captcha token - completely removed
    originalHandleSubmit(e, 'BYPASS_COMPLETELY_DISABLED', missionPreference);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome Agente */}
      <FormField
        id="name"
        type="text"
        label={t('register_form_label_name')}
        placeholder={t('register_form_placeholder_name')}
        value={formData.name}
        onChange={handleChange}
        icon={<User className="h-4 w-4" />}
        error={errors.name}
        disabled={isSubmitting}
      />

      {/* Email */}
      <FormField
        id="email"
        type="email"
        label={t('auth_label_email')}
        placeholder={t('register_form_placeholder_email')}
        value={formData.email}
        onChange={handleChange}
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
        disabled={isSubmitting}
      />

      {/* Password */}
      <FormField
        id="password"
        type="password"
        label={t('auth_label_password')}
        placeholder={t('register_form_placeholder_password')}
        value={formData.password}
        onChange={handleChange}
        icon={<Lock className="h-4 w-4" />}
        error={errors.password}
        disabled={isSubmitting}
      />

      {/* Conferma Password */}
      <FormField
        id="confirmPassword"
        type="password"
        label={t('register_form_label_confirm_password')}
        placeholder={t('register_form_placeholder_password')}
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword}
        disabled={isSubmitting}
      />

      {/* Submit Button - matches LoginPage style */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] hover:opacity-90 text-white font-bold text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
          />
        ) : (
          <ArrowRight className="w-5 h-5 mr-2" />
        )}
        {isSubmitting ? t('register_form_btn_submitting') : t('register_form_btn_submit')}
      </Button>
    </form>
  );
};

export default RegistrationForm;
