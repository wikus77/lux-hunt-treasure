
import { ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`bg-black/50 border-white/10 text-white ${icon ? 'pl-10' : 'pl-3'}`}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCorrect="off"
          spellCheck={false}
          data-form-type="other"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
