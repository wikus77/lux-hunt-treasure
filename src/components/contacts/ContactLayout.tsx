
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BackgroundParticles from "@/components/ui/background-particles";
import ContactHero from "./ContactHero";
import ContactQuickInfo from "./ContactQuickInfo";
import ContactSupportAlert from "./ContactSupportAlert";
import ContactMain from "./ContactMain";
import FaqSection from "./FaqSection";
import ContactFooter from "./ContactFooter";

interface ContactLayoutProps {
  isBeforeLaunch: boolean;
}

const ContactLayout: React.FC<ContactLayoutProps> = ({ isBeforeLaunch }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Background effects */}
      <BackgroundParticles count={15} />
      
      {/* Main content */}
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          
          {/* Hero section */}
          <ContactHero />

          {/* Contact quick info */}
          <ContactQuickInfo />
          
          {/* Status Alert */}
          <ContactSupportAlert />
          
          {/* Contact info and form */}
          <ContactMain />
          
          {/* FAQ Section - Only shown if not in pre-launch mode or after launch */}
          {!isBeforeLaunch && <FaqSection />}
        </div>
      </main>
      
      {/* Footer */}
      <ContactFooter />
    </div>
  );
};

export default ContactLayout;
