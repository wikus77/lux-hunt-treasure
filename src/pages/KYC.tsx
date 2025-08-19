
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import KYCSection from "@/components/kyc/KYCSection";
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const KYC: React.FC = () => {
  return (
    <PublicLayout>
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla home
        </Link>
        
        <KYCSection />
      </div>
    </PublicLayout>
  );
};

export default KYC;
