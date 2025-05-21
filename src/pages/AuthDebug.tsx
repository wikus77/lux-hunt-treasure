import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthDebug = () => {
  const [email] = useState("wikus77@hotmail.it");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Errore Supabase:", data);
        throw new Error(data.error || "Login fallito");
      }

      const { access_token, refresh_token } = data;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw new Error("Errore nella creazione della sessione");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .single();

      if (profileError || profileData?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Accesso riservato solo agli amministratori");
      }

      toast.success("Login effettuato con successo", {
        description: "Accesso confermato. Reindirizzamento...",
      });

      setTimeout(() => {
        navigate("/test-admin-ui");
      }, 1500);

    } catch (error: any) {
      console.error("Errore durante il login:", error);
      toast.error("Errore durante il login", {
        description: error.message,
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
