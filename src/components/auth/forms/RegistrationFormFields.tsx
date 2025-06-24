
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegistrationFormFieldsProps {
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegistrationFormFields: React.FC<RegistrationFormFieldsProps> = ({
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit
}) => {
  const passwordsMatch = password === confirmPassword;
  const isFormValid = email && password && confirmPassword && passwordsMatch && password.length >= 6;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-email" className="text-white">
          Email
        </Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Inserisci la tua email"
          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password" className="text-white">
          Password
        </Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Crea una password (min. 6 caratteri)"
            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-12"
            required
            disabled={isLoading}
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onTogglePassword}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-confirm-password" className="text-white">
          Conferma Password
        </Label>
        <div className="relative">
          <Input
            id="reg-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Conferma la tua password"
            className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 pr-12 ${
              confirmPassword && !passwordsMatch ? 'border-red-500' : ''
            }`}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onToggleConfirmPassword}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-red-400 text-sm">Le password non coincidono</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink hover:opacity-90 transition-opacity"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? "Registrazione..." : "Registrati"}
      </Button>
    </form>
  );
};
