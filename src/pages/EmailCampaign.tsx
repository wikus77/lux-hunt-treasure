
import React from "react";
import CampaignSender from "@/components/email/CampaignSender";

const EmailCampaign = () => {
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
