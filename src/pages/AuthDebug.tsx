
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTurnstile } from "@/hooks/useTurnstile";

const AuthDebug = () => {
  const [email] = useState("wikus77@hotmail.it");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Utilizzo del hook useTurnstile per gestire la verifica captcha
  const { setTurnstileToken, token, isVerified } = useTurnstile({
    action: 'login',
    autoVerify: true
  });

  // Effetto per impostare un token di bypass quando la pagina si carica
  useEffect(() => {
    // Impostiamo un token di bypass specifico per development
    setTurnstileToken("BYPASS_FOR_DEVELOPMENT");
  }, [setTurnstileToken]);

  // Aggiungiamo un effetto sonoro di notifica per il login riuscito
  const playSuccessSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔑 Tentativo di login per:", email);
      
      // Metodo 1: Prima proviamo direttamente con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: token || "BYPASS_FOR_DEVELOPMENT"
        }
      });

      if (!authError && authData?.session) {
        console.log("✅ Login riuscito con Supabase Auth");
        
        // Verifica del ruolo
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", email)
          .single();
          
        if (profileError || profileData?.role !== "admin") {
          await supabase.auth.signOut();
          throw new Error("Accesso riservato agli amministratori");
        }

        playSuccessSound();
        toast.success("Login riuscito");
        navigate("/test-admin-ui");
        return;
      }
      
      // Se il metodo diretto fallisce, proviamo con la funzione edge
      console.log("⚠️ Login diretto fallito, provo con la funzione edge:", authError?.message);
      
      const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
        },
        body: JSON.stringify({ 
          email, 
          password,
          captchaToken: token || "BYPASS_FOR_DEVELOPMENT"
        }),
      });

      const data = await res.json();
      console.log("📦 RISPOSTA login-no-captcha:", data);

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login fallito");
      }

      const { access_token, refresh_token } = data;

      if (!access_token || !refresh_token) {
        throw new Error("Token mancante nella risposta");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw new Error("Errore nella creazione della sessione: " + sessionError.message);
      }

      console.log("✅ Sessione creata");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .single();

      console.log("🧑 Profilo:", profileData);

      if (profileError || profileData?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Accesso riservato agli amministratori");
      }

      playSuccessSound();
      toast.success("Login riuscito");
      navigate("/test-admin-ui");

    } catch (err: any) {
      console.error("❌ Login Error:", err);
      toast.error("Errore durante il login", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Debug Login</h1>
          <p className="text-gray-400 mt-1">Solo per amministratori</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-black/50 text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-black/50 text-white"
              placeholder="Inserisci password"
            />
          </div>

          {/* Indicatore di stato dell'autenticazione */}
          <div className="text-xs text-cyan-500">
            {token ? "Token bypass attivo" : "Nessun token disponibile"}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Autenticazione in corso..." : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthDebug;
