
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTurnstile } from "@/hooks/useTurnstile";
import StyledInput from "@/components/ui/styled-input";
import { Key, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthDebug = () => {
  const [email] = useState("wikus77@hotmail.it");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  const [token, setToken] = useState("BYPASS_FOR_DEVELOPMENT");

  const { setTurnstileToken } = useTurnstile({
    action: 'login',
    autoVerify: true
  });

  useEffect(() => {
    setTurnstileToken("BYPASS_FOR_DEVELOPMENT");
    console.log("🚀 Debug Login inizializzato");
    checkCurrentSession();
  }, [setTurnstileToken]);

  const checkCurrentSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatusMessage(`Sessione attiva: ${data.session.user.email}`);
        setDebugInfo({
          userId: data.session.user.id,
          email: data.session.user.email,
          sessionExpiry: new Date(data.session.expires_at! * 1000).toLocaleString(),
        });

        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (profileData) {
          setDebugInfo(prev => ({ ...prev, role: profileData.role }));
          if (profileData.role === 'admin') {
            toast.info("Sessione admin già attiva", {
              description: "Reindirizzamento alla dashboard admin"
            });
            setTimeout(() => navigate("/test-admin-ui"), 1500);
          }
        } else {
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("role")
            .eq("email", data.session.user.email)
            .maybeSingle();

          if (profileByEmail) {
            setDebugInfo(prev => ({ ...prev, role: profileByEmail.role }));
            if (profileByEmail.role === 'admin') {
              toast.info("Sessione admin già attiva", {
                description: "Reindirizzamento alla dashboard admin"
              });
              setTimeout(() => navigate("/test-admin-ui"), 1500);
            }
          }
        }
      } else {
        setStatusMessage("Nessuna sessione attiva");
      }
    } catch (err) {
      console.error("Errore nel controllo della sessione:", err);
      setStatusMessage("Errore nel controllo della sessione");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setStatusMessage("Tentativo di login in corso...");

    try {
      // 🔧 BYPASS SVILUPPATORE: Disabilita validazioni CAPTCHA per wikus77@hotmail.it
      console.log("🔧 Modalità sviluppatore attiva - bypass CAPTCHA");
      
      const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-turnstile-response": token, // Token bypass
        },
        body: JSON.stringify({ email, password: password || "qualsiasi_password" })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Errore login");
      }

      const { access_token, refresh_token } = data;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw new Error("Errore nella creazione della sessione: " + sessionError.message);
      }

      setStatusMessage("Login completato con successo!");
      toast.success("Login riuscito (modalità sviluppatore)", {
        description: "Accesso automatico senza validazioni"
      });
      navigate("/test-admin-ui");

    } catch (err: any) {
      console.error("❌ Login Error:", err);
      setError(err.message || "Errore durante il login");
      toast.error("Errore durante il login", {
        description: err.message,
      });
      setStatusMessage("Login fallito");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
        <div className="text-center mb-6">
          <ShieldCheck className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-1">Accesso riservato (Dev Mode)</p>
          <div className="mt-2 p-2 bg-orange-800/30 rounded text-sm">
            <p className="text-orange-300">🔧 Modalità sviluppatore attiva</p>
            <p className="text-xs text-orange-400">Bypass CAPTCHA e password</p>
          </div>
          {statusMessage && (
            <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
              <p className="text-cyan-400">{statusMessage}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <StyledInput
            id="email"
            type="email"
            value={email}
            onChange={() => {}}
            icon={<Mail size={16} />}
            placeholder="Email amministratore"
            className="bg-black/50 border-gray-700/50 cursor-not-allowed"
            readOnly={true}
          />
          <StyledInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Key size={16} />}
            placeholder="Qualsiasi password (opzionale)"
            className="border-gray-700/50"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                <span>Autenticazione in corso...</span>
              </>
            ) : "Accedi (Dev Mode)"}
          </Button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md">
            <h3 className="text-red-400 font-medium mb-1">Errore</h3>
            <p className="text-white text-sm">{error}</p>
          </div>
        )}
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-md overflow-auto">
            <h3 className="text-cyan-400 font-medium mb-2">Debug Info</h3>
            <pre className="text-xs text-white whitespace-pre-wrap break-words">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
