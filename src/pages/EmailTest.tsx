
import React from "react";
import MailjetTester from "@/components/email/MailjetTester";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const EmailTest = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Test Invio Email Mailjet
        </h1>
        <div className="max-w-xl mx-auto">
          <MailjetTester />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EmailTest;
