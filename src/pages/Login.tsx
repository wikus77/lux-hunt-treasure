
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validations
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi per continuare."
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate a successful login
    try {
      // Storing a dummy user state in localStorage for demonstration
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      toast({
        title: "Login completato!",
        description: "Accesso effettuato con successo."
      });

      // Redirect to home page
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante il login."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-glow">
            M1SSION
          </h1>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Accesso in corso..." : "Accedi"}
          </Button>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-projectx-neon-blue p-0 hover:underline"
              onClick={() => navigate("/register")}
              disabled={isSubmitting}
            >
              Non hai un account? Registrati
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Accedendo accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
