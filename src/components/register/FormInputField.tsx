
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface FormInputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
}

const FormInputField: React.FC<FormInputFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
          <Icon size={16} />
        </div>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-black/50 border-white/10 pl-10"
        />
      </div>
    </div>
  );
};

export default FormInputField;
