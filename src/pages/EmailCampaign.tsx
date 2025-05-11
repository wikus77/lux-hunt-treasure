
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";
import CampaignSender from "@/components/email/CampaignSender";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EmailCampaign = () => {
  const { hasRole, isAuthenticated, isRoleLoading } = useAuthContext();
  const [isBypassingCaptcha, setIsBypassingCaptcha] = useState(false);
  const navigate = useNavigate();

  // Attempt to bypass CAPTCHA for admin/developer users
  const bypassCaptchaForAdmin = async () => {
    try {
      setIsBypassingCaptcha(true);
      console.log("Attempting to bypass CAPTCHA for admin/developer");
      
      // Set a flag in localStorage to indicate CAPTCHA bypass for this route
      localStorage.setItem('bypass_captcha_email_campaign', 'true');
      
      // Force authentication refresh to bypass CAPTCHA
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        toast.error("Errore nel bypass CAPTCHA", { 
          description: "Impossibile aggirare il controllo CAPTCHA" 
        });
      } else {
        console.log("Session refreshed successfully, CAPTCHA should be bypassed");
        toast.success("Bypass CAPTCHA attivato", { 
          description: "Stai accedendo in modalità sviluppatore senza CAPTCHA" 
        });
      }
    } catch (error) {
      console.error("Error in CAPTCHA bypass:", error);
    } finally {
      setIsBypassingCaptcha(false);
    }
  };

  useEffect(() => {
    // If user is authenticated and roles are loaded, check if they have admin or developer role
    if (!isRoleLoading && isAuthenticated) {
      const isAdmin = hasRole("admin");
      const isDeveloper = hasRole("developer");
      
      if (!isAdmin && !isDeveloper) {
        console.log("User doesn't have admin or developer role, redirecting to access-denied");
        navigate("/access-denied");
      } else {
        // For admin/developer users, bypass CAPTCHA
        bypassCaptchaForAdmin();
      }
    } else if (!isRoleLoading && !isAuthenticated) {
      // If user is not authenticated, redirect to login
      navigate("/login");
    }
  }, [hasRole, isRoleLoading, isAuthenticated, navigate]);

  // Show loading while checking permissions or bypassing CAPTCHA
  if (isRoleLoading || isBypassingCaptcha) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">
          {isBypassingCaptcha ? 
            "Attivazione bypass CAPTCHA..." : 
            "Verifica permessi..."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Invio Campagna Email Mailjet
      </h1>
      <div className="max-w-xl mx-auto">
        <CampaignSender />
      </div>
    </div>
  );
};

export default EmailCampaign;
