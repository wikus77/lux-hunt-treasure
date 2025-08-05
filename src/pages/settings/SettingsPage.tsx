// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileImage } from '@/hooks/useProfileImage';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { User, Shield, Target, Bell, CreditCard, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentProfileSettings from './AgentProfileSettings';
import SecuritySettings from './SecuritySettings';
import MissionSettings from './MissionSettings';
import NotificationsSettings from './NotificationsSettings';
import PaymentSettings from './PaymentSettings';
import LegalSettings from './LegalSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AppInfoSettings from './AppInfoSettings';

type SettingsSection = 'profile' | 'security' | 'mission' | 'notifications' | 'privacy' | 'legal' | 'info';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { profileImage } = useProfileImage();
  const [location, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Handle URL-based section routing
  useEffect(() => {
    const path = location;
    if (path.includes('/settings/')) {
      const section = path.split('/settings/')[1] as SettingsSection;
      const validSections: SettingsSection[] = ['profile', 'security', 'mission', 'notifications', 'privacy', 'legal', 'info'];
      if (validSections.includes(section)) {
        setActiveSection(section);
      }
    }
  }, [location]);

  // Handle section change with URL update
  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
    navigate(`/settings/${section}`);
  };

  const settingsSections = [
    { 
      id: 'profile' as SettingsSection, 
      label: 'Profilo Agente', 
      icon: User,
      description: 'Avatar, nome e informazioni agente'
    },
    { 
      id: 'security' as SettingsSection, 
      label: 'Sicurezza', 
      icon: Shield,
      description: 'Password e codici di emergenza'
    },
    { 
      id: 'mission' as SettingsSection, 
      label: 'Missione', 
      icon: Target,
      description: 'Stato missioni e progressi'
    },
    { 
      id: 'notifications' as SettingsSection, 
      label: 'Notifiche', 
      icon: Bell,
      description: 'Preferenze e alert'
    },
    { 
      id: 'privacy' as SettingsSection, 
      label: 'Privacy', 
      icon: Shield,
      description: 'Gestione consensi e cookie'
    },
    { 
      id: 'legal' as SettingsSection, 
      label: 'Legale', 
      icon: FileText,
      description: 'Termini, privacy e account'
    },
    { 
      id: 'info' as SettingsSection, 
      label: 'Info App', 
      icon: Info,
      description: 'Versione, supporto e credits'
    },
  ];

  // This page shows ONLY the settings navigation list

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <div 
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Settings Navigation */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">Impostazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settingsSections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full justify-start p-4 h-auto ${
                    isActive 
                      ? 'bg-[#00D1FF]/20 text-white border border-[#00D1FF]/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-white/50">{section.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* This page shows ONLY the navigation list - no content */}
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

export default SettingsPage;