
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";
import CampaignSender from "@/components/email/CampaignSender";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

/**
 * Special development version of the EmailCampaign page
 * that completely bypasses CAPTCHA verification
 */
const DevCampaignTest = () => {
  const { hasRole, isAuthenticated, isRoleLoading } = useAuthContext();
  const navigate = useNavigate();

  // Only check for roles, no CAPTCHA handling
  React.useEffect(() => {
    if (!isRoleLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      
      // If authenticated but not admin or developer, redirect to access denied
      const isAdmin = hasRole("admin");
      const isDeveloper = hasRole("developer");
      
      if (!isAdmin && !isDeveloper) {
        console.log("User doesn't have admin or developer role, redirecting to access-denied");
        navigate("/access-denied");
      } else {
        // Log that we're in the CAPTCHA-free version
        console.log("Using CAPTCHA-free development campaign test page");
        toast.info("Modalità sviluppo attiva", { 
          description: "Stai utilizzando la pagina di sviluppo senza CAPTCHA" 
        });
      }
    }
  }, [hasRole, isRoleLoading, isAuthenticated, navigate]);

  // Show loading while checking permissions
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">Verifica permessi...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Invio Campagna Email Mailjet <span className="text-amber-400">(Dev Mode)</span>
      </h1>
      <div className="bg-amber-700 text-black p-4 rounded mb-6 max-w-xl mx-auto">
        <strong>⚠️ Modalità Sviluppo:</strong> Questa pagina è una versione speciale senza controlli CAPTCHA.
      </div>
      <div className="max-w-xl mx-auto">
        <CampaignSender />
      </div>
    </div>
  );
};

export default DevCampaignTest;
