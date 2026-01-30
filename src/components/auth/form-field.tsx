// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 VISUAL ALIGNMENT: Matches LoginPage input styling

import { ChangeEvent, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

const FormField = ({
  id,
  type,
  label,
  placeholder = "",
  value,
  onChange,
  icon,
  error,
  required = false,
  disabled = false,
  autoComplete = "off"
}: FormFieldProps) => {
  // State per mostrare/nascondere password
  const [showPassword, setShowPassword] = useState(false);
  
  // Determina il tipo effettivo dell'input
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white/80">{label}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-white/40">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00D1FF]/50 ${icon ? 'pl-10' : 'pl-3'} ${isPasswordField ? 'pr-10' : ''} ${error ? 'border-red-500/50' : ''}`}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCorrect="off"
          spellCheck={false}
          data-form-type="other"
        />
        {/* Toggle visibilità password - matches LoginPage style */}
        {isPasswordField && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-full px-3 text-white/40 hover:text-white"
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FormField;
