
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, ChevronRight, LogOut, Bell, Globe, CreditCard } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import AccountSection from "@/components/settings/AccountSection";
import RegulationSection from "@/components/settings/RegulationSection";
import AppSection from "@/components/settings/AppSection";
import NotificationSection from "@/components/settings/NotificationSection";
import SupportSection from "@/components/settings/SupportSection";
import PaymentMethodsSection from "@/components/settings/PaymentMethodsSection";
import PrivacySecuritySection from "@/components/settings/PrivacySecuritySection";
import RoleSwitcher from "@/components/auth/RoleSwitcher";

const Settings = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Add state for app settings
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState("Italiano");
  
  // Add state for notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Add state for collapsible sections
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Errore durante il logout");
    }
  };

  const handleEmailClick = () => {
    navigate('/notifications');
  };

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick}
      />
      
      <div className="h-[72px] w-full" />
      
      {/* Title section with back button aligned horizontally - positioned below header */}
      <div className="flex items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+72px)] mb-6">
        <button onClick={() => navigate(-1)} className="w-6 h-6 text-white" aria-label="Torna indietro">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold text-white">Impostazioni</h1>
      </div>
      
      {/* Main content with proper spacing */}
      <div className="pb-24 px-4 max-w-screen-xl mx-auto pt-4">
        {/* Admin Role Switcher (only visible to admins) */}
        <RoleSwitcher />
        
        {/* Account Settings - Now collapsible */}
        <AccountSection />
        
        {/* Subscription Section - Now collapsible */}
        <div className="mb-6">
          <div className="glass-card p-4">
            <Collapsible open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <User className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                  Abbonamento
                </h2>
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${isSubscriptionOpen ? 'rotate-90' : ''}`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4 text-white">
                  <div className="p-4 border border-white/10 rounded-lg bg-gradient-to-r from-projectx-blue/20 to-projectx-pink/20">
                    <h3 className="font-semibold mb-2">Piano attuale: Free</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Aggiorna il tuo abbonamento per sbloccare funzionalità premium
                    </p>
                    <Button 
                      onClick={() => navigate('/subscriptions')}
                      className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
                    >
                      Visualizza tutti i piani
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Privacy & Security Section */}
        <PrivacySecuritySection />
        
        {/* Regulation Section - Now collapsible */}
        <div className="mb-6">
          <div className="glass-card p-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Lock className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                  Regolamento Ufficiale M1SSION™
                </h2>
                <ChevronRight className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <RegulationSection />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Payment Methods Section - Now properly collapsible */}
        <div className="mb-6">
          <div className="glass-card p-4">
            <Collapsible open={isPaymentMethodsOpen} onOpenChange={setIsPaymentMethodsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                  Metodi di Pagamento
                </h2>
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${isPaymentMethodsOpen ? 'rotate-90' : ''}`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <PaymentMethodsSection />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* App Settings */}
        <AppSection 
          soundEffects={soundEffects}
          language={language}
          setSoundEffects={setSoundEffects}
        />
        
        {/* Notification Settings */}
        <NotificationSection 
          pushNotifications={pushNotifications}
          emailNotifications={emailNotifications}
          setPushNotifications={setPushNotifications}
          setEmailNotifications={setEmailNotifications}
        />
        
        {/* Support & Help */}
        <SupportSection />
                
        {/* Logout Button */}
        <div className="mt-8">
          {!showLogoutConfirm ? (
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Esci dall'account
            </Button>
          ) : (
            <div className="flex flex-col gap-3 p-4 border border-red-500/30 rounded-lg bg-red-950/20">
              <p className="text-white text-center">Sei sicuro di voler uscire?</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Annulla
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={handleLogout}
                >
                  Conferma
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Settings;
