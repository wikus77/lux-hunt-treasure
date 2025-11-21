
import { ChangeEvent } from "react";

interface StyledInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  id: string;
  type: string;
  placeholder: string;
  className?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

const StyledInput = ({
  value,
  onChange,
  id,
  type,
  placeholder,
  className,
  icon,
  readOnly,
  required,
  disabled,
  autoComplete = "off"
}: StyledInputProps) => {
  // Split the input value to style first two letters differently
  const firstTwoChars = type === 'password' ? '••'.slice(0, Math.min(2, value.length)) : value.slice(0, 2);
  const restChars = type === 'password' 
    ? '•'.repeat(Math.max(0, value.length - 2)) 
    : value.slice(2);
  
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type === 'password' ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`bg-black/50 border-white/10 ${icon ? 'pl-10' : 'pl-3'} w-full h-10 rounded-md border px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className} text-transparent`}
        readOnly={readOnly}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        autoCorrect="off"
        spellCheck={false}
        data-form-type="other"
      />
      {/* Overlay div showing styled text */}
      {value && (
        <div 
          className={`absolute inset-0 flex items-center ${icon ? 'pl-10' : 'pl-3'} pointer-events-none px-3 py-2`}
          style={{ letterSpacing: '0.025em' }}
        >
          <span className="text-[#00E5FF]">{firstTwoChars}</span>
          <span className="text-white">{restChars}</span>
        </div>
      )}
    </div>
  );
};

export default StyledInput;
