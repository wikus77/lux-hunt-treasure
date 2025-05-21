
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AuthDebug = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("📦 RISPOSTA login-no-captcha:", data);

      if (!res.ok) {
        console.error("Errore Supabase:", data);
        throw new Error(data.error || "Login fallito");
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

      toast.success("Login riuscito");
      navigate("/test-admin-ui");

    } catch (err: any) {
      console.error("Errore durante il login:", err);
      toast.error("Errore durante il login", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Debug Login</h1>
          <p className="mt-2 text-gray-400">Pagina di debug per amministratori</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Autenticazione..." : "Accedi"}
          </Button>
        </form>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          Questa pagina è solo per uso amministrativo interno.
        </p>
      </div>
    </div>
  );
};

export default AuthDebug;
