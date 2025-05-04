
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Lock, Check } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: useToastHook } = useToast();

  // Generate random floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 10,
    color: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
  }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Errore", {
        description: "Completa tutti i campi per continuare.",
        duration: 3000
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Errore", {
        description: "Le password non coincidono.",
        duration: 3000
      });
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 8px ${particle.color}`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
            }}
            animate={{
              y: [0, -20, 0, 20, 0],
              x: [0, 10, 20, 10, 0],
              opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
            }}
            transition={{
              duration: particle.duration,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with logo */}
        <div className="text-center mb-8 relative">
          <h1 className="mission-heading">
            <span style={{ color: '#00E5FF' }} className="text-[#00E5FF]">M1</span>
            <span style={{ color: '#FFFFFF' }} className="text-white">SSION</span>
          </h1>
          <p className="text-white/70 mb-2">Crea il tuo account</p>
          <div className="line-glow"></div>
          <div className="mission-motto mt-2">IT IS POSSIBLE</div>
        </div>

        {/* Registration form */}
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form onSubmit={handleRegister} className="space-y-6 p-6">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome completo</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <User size={16} />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Il tuo nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border-white/10 pl-10"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Mail size={16} />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="La tua email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-white/10 pl-10"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Lock size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crea una password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/10 pl-10"
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Check size={16} />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Conferma la password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/50 border-white/10 pl-10"
                />
              </div>
            </div>

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
                onClick={() => navigate("/login")}
                type="button"
              >
                Hai già un account? Accedi
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Terms and conditions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/50">
            Registrandoti accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
