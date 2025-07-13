
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, CreditCard, ChevronRight, LogOut, Bell, Globe } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import AccountSection from "@/components/settings/AccountSection";
import AppSection from "@/components/settings/AppSection";
import NotificationSection from "@/components/settings/NotificationSection";
import SupportSection from "@/components/settings/SupportSection";
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
      
      <div className="pb-24 px-4 pt-2 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Impostazioni</h1>
        </div>
        
        {/* Admin Role Switcher (only visible to admins) */}
        <RoleSwitcher />
        
        {/* Account Settings */}
        <AccountSection />
        
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
