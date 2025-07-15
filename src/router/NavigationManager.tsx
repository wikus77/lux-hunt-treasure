// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Navigation Manager - Zustand-based iOS Capacitor Compatible

import React, { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import { detectCapacitorEnvironment } from '@/utils/capacitor';

// Page Components - STATIC IMPORTS FOR iOS COMPATIBILITY
import Index from '@/pages/Index';
import AppHome from '@/pages/AppHome';
import Map from '@/pages/Map';
import { BuzzPage } from '@/pages/BuzzPage';
import Games from '@/pages/Games';
import Leaderboard from '@/pages/Leaderboard';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import SettingsPage from '@/pages/settings/SettingsPage';
import Subscriptions from '@/pages/Subscriptions';
import PersonalInfoPage from '@/pages/profile/PersonalInfoPage';
import SecurityPage from '@/pages/profile/SecurityPage';
import PaymentsPage from '@/pages/profile/PaymentsPage';
import SilverPlanPage from '@/pages/subscriptions/SilverPlanPage';
import GoldPlanPage from '@/pages/subscriptions/GoldPlanPage';
import BlackPlanPage from '@/pages/subscriptions/BlackPlanPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import MissionSelection from '@/pages/MissionSelection';
import HowItWorks from '@/pages/HowItWorks';
import Contacts from '@/pages/Contacts';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import LegalTerms from '@/pages/legal/Terms';
import Privacy from '@/pages/legal/Privacy';
import SafeCreative from '@/pages/legal/SafeCreative';

interface NavigationManagerProps {
  children?: React.ReactNode;
}

// Page Registry - iOS Capacitor Compatible
const pageRegistry: Record<string, React.ComponentType> = {
  '/': Index,
  '/home': AppHome,
  '/map': Map,
  '/buzz': BuzzPage,
  '/games': Games,
  '/leaderboard': Leaderboard,
  '/notifications': Notifications,
  '/profile': Profile,
  '/settings': SettingsPage,
  '/subscriptions': Subscriptions,
  '/profile/personal-info': PersonalInfoPage,
  '/profile/security': SecurityPage,
  '/profile/payments': PaymentsPage,
  '/subscriptions/silver': SilverPlanPage,
  '/subscriptions/gold': GoldPlanPage,
  '/subscriptions/black': BlackPlanPage,
  '/login': Login,
  '/register': Register,
  '/select-mission': MissionSelection,
  '/how-it-works': HowItWorks,
  '/contacts': Contacts,
  '/privacy-policy': PrivacyPolicy,
  '/terms': Terms,
  '/legal/terms': LegalTerms,
  '/legal/privacy': Privacy,
  '/legal/safecreative': SafeCreative,
};

const NavigationManager: React.FC<NavigationManagerProps> = () => {
  const { currentTab, setCapacitorMode } = useNavigationStore();
  const isCapacitor = detectCapacitorEnvironment();

  console.log('🧭 NavigationManager render:', {
    currentTab,
    isCapacitor,
    timestamp: new Date().toISOString()
  });

  // Initialize Capacitor mode
  useEffect(() => {
    setCapacitorMode(isCapacitor);
    
    // iOS WebView optimization
    if (isCapacitor) {
      console.log('📱 Capacitor environment detected - applying iOS optimizations');
      document.body.style.overscrollBehavior = 'none';
      (document.body.style as any).WebkitOverflowScrolling = 'touch';
    }
  }, [isCapacitor, setCapacitorMode]);

  // Get current page component
  const getCurrentPageComponent = (): React.ComponentType => {
    const PageComponent = pageRegistry[currentTab];
    
    if (!PageComponent) {
      console.warn('🔍 Page not found for:', currentTab);
      return NotFound;
    }
    
    return PageComponent;
  };

  const CurrentPage = getCurrentPageComponent();

  return (
    <SafeAreaWrapper className="min-h-screen bg-gradient-to-br from-black via-[#0B1426] to-[#1a1a2e]">
      <div className="relative min-h-screen">
        <CurrentPage />
      </div>
    </SafeAreaWrapper>
  );
};

export default NavigationManager;