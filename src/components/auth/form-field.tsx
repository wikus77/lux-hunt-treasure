
import { ChangeEvent, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
      <Label htmlFor={id} className="text-white">{label}</Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`bg-black/50 border-white/10 text-white ${icon ? 'pl-10' : 'pl-3'} ${isPasswordField ? 'pr-10' : ''}`}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCorrect="off"
          spellCheck={false}
          data-form-type="other"
        />
        {/* Toggle visibilità password */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
