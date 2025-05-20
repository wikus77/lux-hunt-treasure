
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TurnstileWidget from "@/components/security/TurnstileWidget";

const AuthDebug = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        console.log("Current user email:", userData.user?.email);
        if (userData.user?.email === "wikus77@hotmail.it") {
          console.log("Admin user detected");
        }
      } else {
        console.log("No active session");
      }
    };
    
    checkAuthorization();
  }, [navigate, email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== "wikus77@hotmail.it") {
      toast.error("Accesso negato", { description: "Non sei autorizzato a utilizzare questa pagina" });
      return;
    }

    try {
      setIsLoading(true);
      
      // Pass the turnstileToken as part of the gotrue_meta_security object
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: turnstileToken || "BYPASS_FOR_DEVELOPMENT"
        }
      });
      
      if (error) {
        throw error;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      
      if (profileError) {
        throw new Error("Errore durante il recupero delle informazioni dell'utente");
      }
      
      if (profileData.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Accesso consentito solo agli amministratori");
      }
      
      toast.success("Login effettuato con successo", { description: "Reindirizzamento alla pagina di gestione..." });
      
      setTimeout(() => {
        navigate("/test-admin-ui");
      }, 1500);
      
    } catch (error: any) {
      console.error("Errore durante il login:", error);
      toast.error("Errore durante il login", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Debug Login</h1>
          <p className="text-gray-400 mt-1">Solo per sviluppo e debug</p>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 mb-6">
          <p className="text-yellow-300 text-sm">
            ⚠️ Questa pagina è riservata all'amministratore per scopi di debug.
          </p>
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-black/50 text-white"
              placeholder="Inserisci email"
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
          
          <div className="mt-2">
            <TurnstileWidget 
              onVerify={setTurnstileToken} 
              action="login_debug"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Autenticazione in corso..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthDebug;
