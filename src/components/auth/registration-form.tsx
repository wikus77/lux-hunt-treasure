
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Check } from "lucide-react";
import FormField from "./form-field";
import { useRegistration } from "@/hooks/use-registration";

interface RegistrationFormProps {
  className?: string;
}

const RegistrationForm = ({ className }: RegistrationFormProps) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  } = useRegistration();

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Name field */}
        <FormField
          id="name"
          type="text"
          label="Nome completo"
          placeholder="Il tuo nome"
          value={formData.name}
          onChange={handleChange}
          icon={<User size={16} />}
          error={errors.name}
        />

        {/* Email field */}
        <FormField
          id="email"
          type="email"
          label="Email"
          placeholder="La tua email"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail size={16} />}
          error={errors.email}
        />

        {/* Password field */}
        <FormField
          id="password"
          type="password"
          label="Password"
          placeholder="Crea una password"
          value={formData.password}
          onChange={handleChange}
          icon={<Lock size={16} />}
          error={errors.password}
        />

        {/* Confirm Password field */}
        <FormField
          id="confirmPassword"
          type="password"
          label="Conferma Password"
          placeholder="Conferma la password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={<Check size={16} />}
          error={errors.confirmPassword}
        />

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full neon-button-cyan"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrazione in corso..." : "Registrati Ora"}
        </Button>

        {/* Login link */}
        <div className="text-center">
          <Button
            variant="link"
            className="text-cyan-400"
            onClick={() => window.location.href = "/login"}
            type="button"
          >
            Hai già un account? Accedi
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;
