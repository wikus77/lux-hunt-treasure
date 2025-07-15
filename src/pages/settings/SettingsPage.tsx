// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileImage } from '@/hooks/useProfileImage';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { User, Shield, Target, Bell, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentProfileSettings from './AgentProfileSettings';
import SecuritySettings from './SecuritySettings';
import MissionSettings from './MissionSettings';
import NotificationsSettings from './NotificationsSettings';
import PaymentSettings from './PaymentSettings';
import LegalSettings from './LegalSettings';

type SettingsSection = 'profile' | 'security' | 'mission' | 'notifications' | 'payments' | 'legal';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { profileImage } = useProfileImage();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

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
      id: 'payments' as SettingsSection, 
      label: 'Pagamenti', 
      icon: CreditCard,
      description: 'Metodi di pagamento e piani'
    },
    { 
      id: 'legal' as SettingsSection, 
      label: 'Legale', 
      icon: FileText,
      description: 'Termini, privacy e account'
    },
  ];

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'profile':
        return <AgentProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'mission':
        return <MissionSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'legal':
        return <LegalSettings />;
      default:
        return <AgentProfileSettings />;
    }
  };

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
                  onClick={() => setActiveSection(section.id)}
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

        {/* Settings Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSettingsContent()}
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;