
import React from "react";
import { useAuthContext } from "@/contexts/auth";
import CampaignSender from "@/components/email/CampaignSender";
import { Spinner } from "@/components/ui/spinner";

const EmailCampaign = () => {
  const { hasRole, isRoleLoading } = useAuthContext();
  
  // Show loading while checking permissions
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">Verifica permessi...</div>
      </div>
    );
  }

  // Permissions are checked via the route, so this component can focus on rendering
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
