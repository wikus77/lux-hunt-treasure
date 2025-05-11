
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth";
import CampaignSender from "@/components/email/CampaignSender";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const EmailCampaign = () => {
  const { hasRole, isAuthenticated, isRoleLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and roles are loaded, check if they have admin or developer role
    if (!isRoleLoading && isAuthenticated) {
      const isAdmin = hasRole("admin");
      const isDeveloper = hasRole("developer");
      
      if (!isAdmin && !isDeveloper) {
        console.log("User doesn't have admin or developer role, redirecting to access-denied");
        navigate("/access-denied");
      } else {
        // We're in developer mode - show a notification
        toast.success("Modalità sviluppatore attiva", { 
          description: "Accesso consentito alla pagina di invio campagne" 
        });
      }
    } else if (!isRoleLoading && !isAuthenticated) {
      // If user is not authenticated, redirect to login
      navigate("/login");
    }
  }, [hasRole, isRoleLoading, isAuthenticated, navigate]);

  // Show loading while checking permissions
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">
          Verifica permessi...
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
