
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Mail, Lock, Check } from "lucide-react";

import FormInputField from "./FormInputField";
import LoginLink from "./LoginLink";
import SubmitButton from "./SubmitButton";
import { useFormValidation } from "./useFormValidation";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { validateForm } = useFormValidation();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form
    if (!validateForm({ name, email, password, confirmPassword })) {
      setIsSubmitting(false);
      return;
    }

    // Simulate successful registration
    setTimeout(() => {
      // Store login info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ name, email }));
      
      toast.success("Registrazione completata!", {
        description: "Il tuo account è stato creato con successo."
      });
      
      // Redirect to home page
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    }, 1500);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 p-6">
      {/* Name field */}
      <FormInputField
        id="name"
        label="Nome completo"
        type="text"
        placeholder="Il tuo nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={User}
      />

      {/* Email field */}
      <FormInputField
        id="email"
        label="Email"
        type="email"
        placeholder="La tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
      />

      {/* Password field */}
      <FormInputField
        id="password"
        label="Password"
        type="password"
        placeholder="Crea una password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
      />

      {/* Confirm Password field */}
      <FormInputField
        id="confirmPassword"
        label="Conferma Password"
        type="password"
        placeholder="Conferma la password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon={Check}
      />

      {/* Submit button */}
      <SubmitButton isSubmitting={isSubmitting} />

      {/* Login link */}
      <LoginLink />
    </form>
  );
};

export default RegisterForm;
