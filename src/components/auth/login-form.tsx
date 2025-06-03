
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function LoginForm() {
  const navigate = useNavigate();

  useEffect(() => {
    const isCapacitor = Capacitor.isNativePlatform();
    const devEmails = ["wikus77@hotmail.it", "dev.wikus77@hotmail.it"];

    const bypassLogin = async () => {
      if (isCapacitor) {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email;

        if (email && devEmails.includes(email)) {
          console.log("✅ BYPASS LOGIN PER SVILUPPATORE:", email);
          navigate("/home");
        }
      }
    };

    bypassLogin();
  }, [navigate]);

  return (
    <div className="text-center text-white pt-10">
      <h1 className="text-xl font-bold">Accesso in corso...</h1>
      <p className="text-sm mt-4">Attendi il reindirizzamento...</p>
    </div>
  );
}
