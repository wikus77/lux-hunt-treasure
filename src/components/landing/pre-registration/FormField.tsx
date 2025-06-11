
import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  type?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  type = "text",
  required = false
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-1">{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 rounded-lg ${error ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'} text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50`}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
