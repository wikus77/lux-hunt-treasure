
import React from 'react';
import { Button } from '@/components/ui/button';
import FormField from './FormField';
import { FormData } from './types';

interface RegistrationFormProps {
  formData: FormData;
  isSubmitting: boolean;
  error: string | null;
  countdownCompleted?: boolean;
  onInputChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  isSubmitting,
  error,
  countdownCompleted = false,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4">
      <FormField
        id="name"
        label="Nome completo"
        type="text"
        value={formData.name}
        onChange={(value) => onInputChange('name', value)}
        placeholder="Inserisci il tuo nome"
        required
      />
      
      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => onInputChange('email', value)}
        placeholder="Inserisci la tua email"
        required
      />
      
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
        className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black font-bold py-3 rounded-full hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Registrazione in corso...
          </div>
        ) : (
          'REGISTRATI SUBITO'
        )}
      </Button>
    </form>
  );
};
