
/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Settings Page with Push Test Integration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, CreditCard, ChevronRight, LogOut, Bell, Globe, Vibrate } from "lucide-react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useProfileImage } from "@/hooks/useProfileImage";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import AccountSection from "@/components/settings/AccountSection";
import AppSection from "@/components/settings/AppSection";
import { hapticManager } from "@/utils/haptics";

import SupportSection from "@/components/settings/SupportSection";
import RoleSwitcher from "@/components/auth/RoleSwitcher";
import { PushEnableButton } from "@/components/push/PushEnableButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enableWebPush } from "@/lib/push/enableWebPush";
import { disableWebPush } from "@/lib/push/disableWebPush";
import { PushTest } from "@/components/push/PushTest";
import { PushDiagnostics } from "@/components/push/PushDiagnostics";
import { OperaResetButton } from "@/components/layout/OperaResetButton";
import { PushE2ETestCard } from "@/settings/PushE2ETestCard";
import { StripeSanityCard } from "@/settings/StripeSanityCard";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";

const Settings = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Add state for app settings
  const [soundEffects, setSoundEffects] = useState(true);
  const [language, setLanguage] = useState("Italiano");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(hapticManager.getEnabled());

  // Check push subscription status on mount and refresh properly
  useEffect(() => {
    const checkPushStatus = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // Make sure we get the active registration, not just any registration
          const reg = await navigator.serviceWorker.ready;
          const subscription = await reg.pushManager.getSubscription();
          const active = !!subscription;
          
          console.log('[Settings] Push subscription status:', { active, endpoint: subscription?.endpoint });
          setPushEnabled(active);
        } catch (error) {
          console.error('[Settings] Error checking push subscription:', error);
          setPushEnabled(false);
        }
      } else {
        setPushEnabled(false);
      }
    };
    
    checkPushStatus();
    
    // Also listen for focus events to refresh state when returning to page
    const handleFocus = () => checkPushStatus();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  
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
        
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border-zinc-700">
            <TabsTrigger value="main" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              ⚙️ Impostazioni
            </TabsTrigger>
            <TabsTrigger value="push-test" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              🧪 Test Push
            </TabsTrigger>
            <TabsTrigger value="dev-tools" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              🛠️ Dev Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="main" className="space-y-6 mt-6">
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
            
            {/* Haptic Feedback Settings */}
            <div className="m1ssion-glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Vibrate className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="text-white font-medium">Feedback Tattile</h3>
                    <p className="text-sm text-gray-400">Vibrazione su azioni e notifiche</p>
                  </div>
                </div>
                <Switch
                  checked={hapticsEnabled}
                  onCheckedChange={(enabled) => {
                    setHapticsEnabled(enabled);
                    hapticManager.setEnabled(enabled);
                    if (enabled) {
                      hapticManager.trigger('success');
                      toast.success('Feedback tattile attivato');
                    } else {
                      toast.success('Feedback tattile disattivato');
                    }
                  }}
                />
              </div>
              {!hapticManager.isSupported() && (
                <p className="text-xs text-yellow-500">
                  ⚠️ Il tuo dispositivo potrebbe non supportare la vibrazione
                </p>
              )}
            </div>
            
            {/* Notification Settings Link */}
            <Link to="/settings/notifications" className="block">
              <div className="m1ssion-glass-card flex justify-between items-center p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-white" />
                  <span className="text-white font-medium">Gestione Notifiche</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>
            </Link>
            
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
          </TabsContent>

          <TabsContent value="push-test" className="mt-6 space-y-4">
            <PushDiagnostics />
            
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
              <PushEnableButton />
            </div>
            
            {/* Opera Fix Button */}
            <div className="flex justify-center">
              <OperaResetButton />
            </div>
            
            {pushEnabled && (
              <PushTest />
            )}
          </TabsContent>

          <TabsContent value="dev-tools" className="mt-6 space-y-4">
            <PushE2ETestCard />
            <StripeSanityCard />
            <PWAUpdatePrompt />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation - Uniform positioning like Home */}
      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export default Settings;
