
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoginForm from "@/components/auth/login-form";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const isCapacitor = Capacitor.isNativePlatform();
    const devEmails = ["wikus77@hotmail.it", "dev.wikus77@hotmail.it"];

    const tryBypass = async () => {
      if (!isCapacitor) return;

      const { data } = await supabase.auth.getSession();
      const email = data?.session?.user?.email;

      if (email && devEmails.includes(email)) {
        console.log("🔓 CAPACITOR DEVELOPER BYPASS: Auto-redirect to /home");
        // Skip Developer Access screen entirely
        navigate("/home", { replace: true });
      } else {
        console.log("👤 Nessun bypass attivo, email non autorizzata:", email);
      }
    };

    tryBypass();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <LoginForm
        verificationStatus="bypassed"
        onResendVerification={async () => {}}
      />
    </div>
  );
}
