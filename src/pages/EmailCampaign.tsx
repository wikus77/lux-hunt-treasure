
import React from "react";
import { useAuthContext } from "@/contexts/auth";
import CampaignSender from "@/components/email/CampaignSender";
import { toast } from "sonner";

/**
 * Admin/Developer only email campaign page
 * CAPTCHA verification is bypassed since access is restricted by role
 */
const EmailCampaign = () => {
  const { hasRole } = useAuthContext();
  
  React.useEffect(() => {
    // No need for redirect logic since RoleBasedProtectedRoute handles authorization
    
    // Notify the user they're in developer mode with CAPTCHA bypass
    toast.success("Modalità sviluppo attiva", { 
      description: "Accesso diretto alla pagina campagna email (bypass CAPTCHA)" 
    });
    
    console.log("Using email campaign page with CAPTCHA bypass");
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Invio Campagna Email Mailjet <span className="text-amber-400">(Accesso Sviluppatore)</span>
      </h1>
      <div className="bg-amber-700 text-black p-4 rounded mb-6 max-w-xl mx-auto">
        <strong>⚠️ Modalità Sviluppo:</strong> Accesso diretto senza controlli CAPTCHA. Riservato ad amministratori e sviluppatori.
      </div>
      <div className="max-w-xl mx-auto">
        <CampaignSender />
      </div>
    </div>
  );
};

export default EmailCampaign;
