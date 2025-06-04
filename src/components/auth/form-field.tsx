
import { ChangeEvent } from 'react';
import { Label } from "@/components/ui/label";
import StyledInput from "@/components/ui/styled-input";

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
  disabled = false
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label}</Label>
      <StyledInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-black/50 border-white/10"
        icon={icon}
        required={required}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
