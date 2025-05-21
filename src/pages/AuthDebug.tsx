
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTurnstile } from "@/hooks/useTurnstile";
import StyledInput from "@/components/ui/styled-input"; 
import { Key, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthDebug = () => {
  const [email] = useState("wikus77@hotmail.it"); // Email predefinita e bloccata
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  
  // Utilizzo del hook useTurnstile per gestire la verifica captcha
  const { setTurnstileToken } = useTurnstile({
    action: 'login',
    autoVerify: true
  });

  // Effetto per impostare un token di bypass quando la pagina si carica
  useEffect(() => {
    // Impostiamo un token di bypass specifico per development
    setTurnstileToken("BYPASS_FOR_DEVELOPMENT");
    console.log("🚀 Debug Login inizializzato");
    
    // Check sessione attuale
    checkCurrentSession();
  }, [setTurnstileToken]);

  const checkCurrentSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setStatusMessage(`Sessione attiva: ${data.session.user.email}`);
        setDebugInfo({
          userId: data.session.user.id,
          email: data.session.user.email,
          sessionExpiry: new Date(data.session.expires_at! * 1000).toLocaleString(),
        });

        // Check admin role
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .maybeSingle();
          
        if (profileData) {
          setDebugInfo(prev => ({
            ...prev,
            role: profileData.role
          }));
          
          // Se siamo già autenticati come admin, naviga alla pagina admin
          if (profileData.role === 'admin') {
            toast.info("Sessione admin già attiva", {
              description: "Reindirizzamento alla dashboard admin"
            });
            setTimeout(() => navigate("/test-admin-ui"), 1500);
          }
        } else {
          // Se non troviamo il profilo, proviamo a cercarlo per email
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("role")
            .eq("email", data.session.user.email)
            .maybeSingle();
            
          if (profileByEmail) {
            setDebugInfo(prev => ({
              ...prev,
              role: profileByEmail.role
            }));
            
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
    } catch (checkErr) {
      console.error("Errore nel controllo della sessione:", checkErr);
      setStatusMessage("Errore nel controllo della sessione");
    }
  };

  // Aggiungiamo un effetto sonoro di notifica per il login riuscito
  const playSuccessSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  // Funzione di creazione profilo admin
  const createAdminProfile = async (userId: string) => {
    try {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          role: "admin",
          full_name: "Admin Debug"
        })
        .select("*")
        .single();
        
      if (insertError) {
        console.error("❌ Errore nella creazione del profilo:", insertError);
        return null;
      }
      
      console.log("✅ Profilo admin creato:", newProfile);
      return newProfile;
    } catch (err) {
      console.error("❌ Errore imprevisto:", err);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setStatusMessage("Tentativo di login in corso...");

    try {
      console.log("🔑 Tentativo di login per:", email);
      
      // Metodo 1: Prima proviamo direttamente con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!authError && authData?.session) {
        console.log("✅ Login riuscito con Supabase Auth");
        
        // Verifica e creazione profilo
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role, id")
            .eq("id", authData.session.user.id)
            .maybeSingle();
            
          setDebugInfo({
            method: "Supabase Auth Diretto",
            userId: authData.session.user.id,
            profile: profileData || "Nessun profilo trovato",
            profileError: profileError?.message || null,
          });
          
          if (!profileData) {
            console.log("Profilo non trovato, creazione automatica...");
            const newProfile = await createAdminProfile(authData.session.user.id);
              
            if (newProfile) {
              setDebugInfo(prev => ({
                ...prev,
                newProfile
              }));
              // Tutto ok!
              playSuccessSound();
              toast.success("Login riuscito e profilo admin creato");
              navigate("/test-admin-ui");
              return;
            }
          } else if (profileData.role !== "admin") {
            console.log("⚙️ Aggiornamento ruolo a admin...");
            await supabase
              .from("profiles")
              .update({ role: "admin" })
              .eq("id", authData.session.user.id);
              
            // Tutto ok!
            playSuccessSound();
            toast.success("Login riuscito e ruolo aggiornato a admin");
            navigate("/test-admin-ui");
            return;
          } else {
            // Tutto ok!
            playSuccessSound();
            toast.success("Login riuscito come admin");
            setStatusMessage("Login riuscito come admin");
            navigate("/test-admin-ui");
            return;
          }
        } catch (profileErr: any) {
          console.error("❌ Errore verifica profilo:", profileErr.message);
          setError(`Errore nella verifica del profilo: ${profileErr.message}`);
        }
      } else {
        console.error("❌ Login diretto fallito:", authError);
      }
      
      // Se siamo qui, il metodo diretto è fallito o il profilo non esiste, proviamo con la funzione edge
      console.log("⚠️ Login diretto fallito o profilo mancante, provo con la funzione edge:", authError?.message);
      setStatusMessage("Tentativo di login con funzione edge...");
      
      const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
        },
        body: JSON.stringify({ 
          email, 
          password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Errore dalla funzione edge:", errorData);
        throw new Error(errorData.error || errorData.message || "Login fallito");
      }

      const data = await res.json();
      console.log("📦 RISPOSTA login-no-captcha:", data);
      
      setDebugInfo({
        method: "Edge Function",
        response: data,
        status: res.status,
      });

      const { access_token, refresh_token } = data;

      if (!access_token || !refresh_token) {
        throw new Error("Token mancante nella risposta");
      }

      // Impostiamo la sessione con i token ricevuti
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw new Error("Errore nella creazione della sessione: " + sessionError.message);
      }

      console.log("✅ Sessione creata");
      setStatusMessage("Sessione creata con successo, verifica profilo...");

      // Verifichiamo il profilo
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      console.log("🧑 Profilo:", profileData);
      
      setDebugInfo(prev => ({
        ...prev,
        profile: profileData || "Nessun profilo trovato",
        profileError: profileError?.message || null,
      }));

      if (profileError) {
        console.warn("⚠️ Errore nel recupero del profilo:", profileError.message);
        // La funzione edge dovrebbe avere creato un profilo, ma in caso di problemi:
        setStatusMessage("Autenticazione riuscita, ma problemi con il profilo utente");
      }

      playSuccessSound();
      toast.success("Login riuscito");
      setStatusMessage("Login completato con successo!");
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

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info("Logout effettuato");
    setStatusMessage("Logout effettuato");
    setDebugInfo(null);
    checkCurrentSession();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
        <div className="text-center mb-6">
          <ShieldCheck className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-1">Accesso riservato</p>
          
          {statusMessage && (
            <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
              <p className="text-cyan-400">{statusMessage}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <StyledInput
              id="email"
              type="email"
              value={email}
              onChange={() => {}} // Non modificabile
              icon={<Mail size={16} />}
              placeholder="Email amministratore"
              className="bg-black/50 border-gray-700/50 cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <StyledInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Key size={16} />}
              placeholder="Inserisci password"
              className="border-gray-700/50"
            />
          </div>

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
            ) : "Accedi"}
          </Button>
          
          {/* Mostra bottone logout se c'è una sessione attiva */}
          {debugInfo?.userId && (
            <Button
              type="button"
              onClick={signOut}
              className="w-full mt-2 bg-red-900/30 hover:bg-red-900/50 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Logout
            </Button>
          )}
        </form>
        
        {/* Sezione di debug */}
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
