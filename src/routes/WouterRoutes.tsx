// M1SSION™ — First Visit Landing Logic & PWA Routing
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";

// Dev tools (conditionally loaded)
const MarkersHealthcheck = React.lazy(() => import('../pages/dev/MarkersHealthcheck'));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Database-based plan choice tracking instead of localStorage
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/WouterProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useQueryQRRedirect } from "@/hooks/useQueryQRRedirect";
import { shouldShowLanding, markFirstVisitCompleted } from "@/utils/firstVisitUtils";
import { supabase } from "@/integrations/supabase/client";


// Static imports for Capacitor iOS compatibility
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";

// Intel module components
import CoordinateSelector from '@/components/intelligence/CoordinateSelector';
import ClueJournal from '@/components/intelligence/ClueJournal';
import ClueArchive from '@/components/intelligence/ClueArchive';
import GeoRadarTool from '@/components/intelligence/GeoRadarTool';
import BuzzInterceptor from '@/components/intelligence/BuzzInterceptor';
import FinalShotPage from '@/components/intelligence/FinalShotPage';
import IntelModuleHeader from '@/components/intelligence/IntelModuleHeader';
import AppHome from "@/pages/AppHome";
import Map from "@/pages/Map";
import { BuzzPage } from "@/pages/BuzzPage";
import IntelligenceStyledPage from "@/pages/IntelligenceStyledPage";
import IntelligenceRAG from "@/pages/IntelligenceRAG";
import IntelligenceAnswerTest from "@/pages/IntelligenceAnswerTest";
import HallOfWinnersStyledPage from "@/pages/HallOfWinnersStyledPage";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import NorahAssistant from "@/pages/NorahAssistant";
import SettingsPage from "@/pages/settings/SettingsPage";
import AgentProfileSettings from "@/pages/settings/AgentProfileSettings";
import SecuritySettings from "@/pages/settings/SecuritySettings";
import MissionSettings from "@/pages/settings/MissionSettings";
import NotificationsSettings from "@/pages/settings/NotificationsSettings";
import PrivacySettings from "@/pages/settings/PrivacySettings";
import LegalSettings from "@/pages/settings/LegalSettings";
import BattleLobby from "@/pages/BattleLobby";
import BattleArena from "@/pages/BattleArena";
import AppInfoSettings from "@/pages/settings/AppInfoSettings";
import DiagnosticsSettings from "@/pages/settings/DiagnosticsSettings";
import PrivacyPermissionsSettings from "@/pages/settings/PrivacyPermissionsSettings";
import Subscriptions from "@/pages/Subscriptions";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SendNotificationPage from "@/pages/admin/SendNotificationPage";
import MissionPanelPage from "@/pages/admin/MissionPanelPage";
import PulseLab from "@/pages/admin/PulseLab";
import PushTestPage from "@/pages/PushTestPage";
import AdminPushConsolePage from "@/pages/push/AdminPushConsolePage";
import PushSenderPanel from "@/pages/panel/PushSenderPanel";
import NotificationDebug from "@/pages/NotificationDebug";
import PanelAccessPage from "@/pages/PanelAccessPage";
import PushDiagnosi from "@/pages/PushDiagnosi";
import PanelUsersPage from "@/pages/PanelUsersPage";
import BulkMarkerDropPage from "@/pages/panel/BulkMarkerDropPage";
import NorahAdmin from "@/pages/panel/NorahAdmin";
import DiagSupabase from "@/pages/DiagSupabase";
import PushTest from "@/pages/debug/PushTest";
import PushDiagnostic from "@/pages/debug/PushDiagnostic";
import M1ssionPushTest from "@/pages/M1ssionPushTest";
import { M1ssionDebugTest } from "@/pages/M1ssionDebugTest";
import FirebaseNotificationDebug from "@/pages/firebase-notification-debug";
// VAPIDKeyTest removed - using Web Push now
import PushHealth from "@/pages/PushHealth";
const PushDebug = React.lazy(() => import("@/pages/PushDebug"));
import { PushReport } from "@/pages/PushReport";
// QR pages removed - rewards now handled by popup in map
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafeCreative from "@/pages/SafeCreative";
import GameRules from "@/pages/GameRules";

// Subscription plan pages
import SilverPlanPage from "@/pages/subscriptions/SilverPlanPage";
import GoldPlanPage from "@/pages/subscriptions/GoldPlanPage";
import BlackPlanPage from "@/pages/subscriptions/BlackPlanPage";
import TitaniumPlanPage from "@/pages/subscriptions/TitaniumPlanPage";
import ChoosePlanPage from "@/pages/ChoosePlanPage";
import SubscriptionVerify from "@/pages/SubscriptionVerify";
import MissionIntroPage from "@/pages/MissionIntroPage";
import FcmTest from "@/pages/FcmTest";

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Import centralizzato
import { getActiveSubscription } from '@/lib/subscriptions';

const WouterRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, getCurrentUser } = useUnifiedAuth();
  const [location, setLocation] = useLocation();
  const [hasActiveSub, setHasActiveSub] = useState<boolean | null>(null);
  const [subCheckLoading, setSubCheckLoading] = useState(false);
  
  useQueryQRRedirect();

  // Check active subscription when user is authenticated - NON BLOCKING with fail-open
  useEffect(() => {
    async function checkSubscription() {
      if (!isAuthenticated || isLoading) {
        setHasActiveSub(null);
        return;
      }

      const user = getCurrentUser();
      if (!user?.id) {
        setHasActiveSub(false);
        return;
      }

      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      // FAIL-OPEN: Background loading with timeout
      setSubCheckLoading(true);
      
      const timeoutId = setTimeout(() => {
        console.warn('[BOOT] Subscription check timeout - proceeding with fail-open');
        setHasActiveSub(false);
        setSubCheckLoading(false);
      }, 3000);
      
      try {
        // Check subscription con helper centralizzato
        const subResult = await getActiveSubscription(supabase, user.id);
        clearTimeout(timeoutId);
        setHasActiveSub(subResult.hasActive);
        
        // Get user profile per admin check e choose_plan_seen flag (non-blocking)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, choose_plan_seen')
          .eq('id', user.id)
          .single();
        
        const isAdmin = ['admin','owner'].some(r => profile?.role?.toLowerCase?.().includes(r));
        
        // SOFT Guard: Suggest /choose-plan ONLY if needed, but don't force
        if (!isAdmin && !subResult.hasActive && !profile?.choose_plan_seen && location === '/') {
          setLocation('/choose-plan');
          return;
        }
        
        // Soft redirect home for initial routes only
        const initialRoutes = ['/', '/login', '/mission-intro', '/subscription-verify'];
        if (subResult.plan === 'free' && initialRoutes.includes(location)) {
          setLocation('/home');
          return;
        }
      } catch (error) {
        console.error('[BOOT] Subscription check error - failing open:', error);
        clearTimeout(timeoutId);
        setHasActiveSub(false);
      } finally {
        setSubCheckLoading(false);
      }
    }

    // Non-blocking call - app can render while this runs
    checkSubscription();
  }, [isAuthenticated, isLoading, getCurrentUser, location, setLocation]);

  const isCapacitorApp = typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || 
     (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));

  console.log('🔍 WOUTER ROUTING STATE DEBUG:', {
    isAuthenticated,
    isLoading,
    isCapacitorApp,
    currentPath: window.location.pathname,
    userExists: !!isAuthenticated,
    timestamp: new Date().toISOString()
  });

  console.log(`✅ ROUTE: Current path = ${window.location.pathname}`);
  console.log(`🔐 AUTH STATUS: isAuthenticated = ${isAuthenticated}, isLoading = ${isLoading}`);

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Switch>
          {/* ✅ QR routes - redirected to main app with marker rewards popup */}

          {/* Landing page - FAIL-OPEN FIRST VISIT LOGIC */}
          <Route path="/">
            {isLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground font-orbitron">Inizializzazione M1SSION™...</p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              (() => {
                try {
                  // Check if this is first visit using localStorage
                  const isFirstVisit = !localStorage.getItem('m1_first_visit_seen');
                  
                  if (isFirstVisit) {
                    localStorage.setItem('m1_first_visit_seen', '1');
                    return <LandingPage />;
                  } else {
                    return <Login />;
                  }
                } catch (error) {
                  console.error('[BOOT] Landing page error, showing login:', error);
                  return <Login />;
                }
              })()
            ) : (
              <ProtectedRoute>
                <GlobalLayout>
                  {/* Render home immediately even if subscription check is pending */}
                  <AppHome />
                  {subCheckLoading && (
                    <div className="fixed top-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Verifica piano...</div>
                    </div>
                  )}
                </GlobalLayout>
              </ProtectedRoute>
            )}
          </Route>

          {/* Protected routes */}
          <Route path="/home">
            <ProtectedRoute>
              <GlobalLayout><AppHome /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/map">
            <ProtectedRoute>
              <GlobalLayout><Map /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/buzz">
            <ProtectedRoute>
              <GlobalLayout><BuzzPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence">
            <ProtectedRoute>
              <GlobalLayout><IntelligenceStyledPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/rag">
            <ProtectedRoute>
              <GlobalLayout><IntelligenceRAG /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/answer-test">
            <ProtectedRoute>
              <GlobalLayout><IntelligenceAnswerTest /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/norah-assistant">
            <ProtectedRoute>
              <GlobalLayout><NorahAssistant /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* TRON BATTLE Routes - © 2025 Joseph MULÉ */}
          <Route path="/battle">
            <ProtectedRoute>
              <BattleLobby />
            </ProtectedRoute>
          </Route>

          <Route path="/battle/:battleId">
            <ProtectedRoute>
              <BattleArena />
            </ProtectedRoute>
          </Route>

          {/* INTEL — sottorotte esclusive */}
          <Route path="/intelligence/coordinates">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="Coordinate Selector" />
                  <CoordinateSelector />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/clue-journal">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="Clue Journal" />
                  <ClueJournal />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/archive">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="Archivio Indizi" />
                  <ClueArchive />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/radar">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="Geo Radar" />
                  <GeoRadarTool />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/interceptor">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="BUZZ Interceptor" />
                  <BuzzInterceptor />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/final-shot">
            <ProtectedRoute>
              <GlobalLayout>
                <div className="min-h-screen w-full overflow-hidden">
                  <IntelModuleHeader title="Final Shot" />
                  <FinalShotPage />
                </div>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence/rag">
            <ProtectedRoute>
              <GlobalLayout><IntelligenceRAG /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/leaderboard">
            <ProtectedRoute>
              <GlobalLayout><HallOfWinnersStyledPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/notifications">
            <GlobalLayout><Notifications /></GlobalLayout>
          </Route>

          <Route path="/profile">
            <ProtectedRoute>
              <GlobalLayout><Profile /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings">
            <ProtectedRoute>
              <GlobalLayout><SettingsPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/agent-profile">
            <ProtectedRoute>
              <GlobalLayout><AgentProfileSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/profile">
            <ProtectedRoute>
              <GlobalLayout><AgentProfileSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/security">
            <ProtectedRoute>
              <GlobalLayout><SecuritySettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/mission">
            <ProtectedRoute>
              <GlobalLayout><MissionSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/notifications">
            <ProtectedRoute>
              <GlobalLayout><NotificationsSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/privacy">
            <ProtectedRoute>
              <GlobalLayout><PrivacySettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/legal">
            <ProtectedRoute>
              <GlobalLayout><LegalSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/app-info">
            <ProtectedRoute>
              <GlobalLayout><AppInfoSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/info">
            <ProtectedRoute>
              <GlobalLayout><AppInfoSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/diagnostics">
            <ProtectedRoute>
              <GlobalLayout><DiagnosticsSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/privacy-permissions">
            <ProtectedRoute>
              <GlobalLayout><PrivacyPermissionsSettings /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions">
            <ProtectedRoute>
              <GlobalLayout><Subscriptions /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Subscription plan pages */}
          <Route path="/subscriptions/silver">
            <ProtectedRoute>
              <GlobalLayout><SilverPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/gold">
            <ProtectedRoute>
              <GlobalLayout><GoldPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/black">
            <ProtectedRoute>
              <GlobalLayout><BlackPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/titanium">
            <ProtectedRoute>
              <GlobalLayout><TitaniumPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Admin routes */}
          <Route path="/admin/send-notification">
            <ProtectedRoute>
              <SendNotificationPage />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/mission-panel">
            <ProtectedRoute>
              <MissionPanelPage />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/pulse-lab">
            <ProtectedRoute>
              <PulseLab />
            </ProtectedRoute>
          </Route>

          <Route path="/panel/push">
            <ProtectedRoute>
              <AdminPushConsolePage />
            </ProtectedRoute>
          </Route>

          <Route path="/panel/push-sender">
            <ProtectedRoute>
              <PushSenderPanel />
            </ProtectedRoute>
          </Route>

          {/* Push Console routes */}
          <Route path="/panel/push-admin">
            <ProtectedRoute>
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(React.lazy(() => import('../pages/push/AdminPushConsolePage')))}
              </React.Suspense>
            </ProtectedRoute>
          </Route>

          <Route path="/panel/push">
            <ProtectedRoute>
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(React.lazy(() => import('../pages/push/UserPushConsolePage')))}
              </React.Suspense>
            </ProtectedRoute>
          </Route>

          {/* Dev diagnostics route - only accessible to admins or in debug mode */}
          <Route path="/dev/markers-healthcheck">
            <ProtectedRoute>
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <MarkersHealthcheck />
              </React.Suspense>
            </ProtectedRoute>
          </Route>


          {/* 🔥 PUSH TEST ROUTE - Fixed rendering */}
          <Route path="/push-test">
            <PushTestPage />
          </Route>

          {/* 🚀 UNIFIED PUSH TEST ROUTE */}
          <Route path="/unified-push-test">
            <GlobalLayout>
              <PushTestPage />
            </GlobalLayout>
          </Route>
          
          <Route path="/push-health">
            <GlobalLayout>
              <PushHealth />
            </GlobalLayout>
          </Route>

          {/* 🔍 NOTIFICATION DEBUG ROUTE - M1SSION™ ULTIMATE */}
          <Route path="/notification-debug">
            <GlobalLayout><NotificationDebug /></GlobalLayout>
          </Route>

          {/* 🔧 DEBUG PUSH TEST ROUTE */}
          <Route path="/debug/pushtest">
            <PushTest />
          </Route>

          {/* 🩺 PUSH DIAGNOSTIC ROUTE - BREAK-GLASS MODE */}
          <Route path="/debug/push">
            <GlobalLayout><PushDiagnostic /></GlobalLayout>
          </Route>
          
          {/* 🔧 PUSH DEBUG CONSOLE */}
          <Route path="/push-debug">
            <GlobalLayout><PushDebug /></GlobalLayout>
          </Route>

          {/* 📊 PUSH REPORT DASHBOARD */}
          <Route path="/push-report">
            <GlobalLayout><PushReport /></GlobalLayout>
          </Route>

          {/* 🛠️ M1SSION™ PIPELINE TEST ROUTE */}
          <Route path="/debug/m1ssion-push-test">
            <ProtectedRoute>
              <GlobalLayout><M1ssionPushTest /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* 🔧 M1SSION™ EMERGENCY DEBUG */}
          <Route path="/debug/raw-test">
            <GlobalLayout><M1ssionDebugTest /></GlobalLayout>
          </Route>

          {/* 🔧 M1SSION™ DEBUG ALTERNATIVE */}
          <Route path="/raw-test">
            <M1ssionDebugTest />
          </Route>

          {/* Panel Access route */}
          <Route path="/panel-access">
            <ProtectedRoute>
              <GlobalLayout><PanelAccessPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/panel-users">
            <ProtectedRoute>
              <PanelUsersPage />
            </ProtectedRoute>
          </Route>

          <Route path="/panel/bulk-marker-drop">
            <ProtectedRoute>
              <BulkMarkerDropPage />
            </ProtectedRoute>
          </Route>

          <Route path="/panel/norah">
            <ProtectedRoute>
              <NorahAdmin />
            </ProtectedRoute>
          </Route>

          <Route path="/diag-supabase">
            <ProtectedRoute>
              <DiagSupabase />
            </ProtectedRoute>
          </Route>

          <Route path="/panel/push-control">
            <ProtectedRoute>
              <GlobalLayout><PanelAccessPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/panel/push-preflight">
            <ProtectedRoute>
              <GlobalLayout><PanelAccessPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* 🔧 Push Diagnostica Route */}
          <Route path="/push-diagnosi">
            <ProtectedRoute>
              <PushDiagnosi />
            </ProtectedRoute>
          </Route>

          {/* 🔥 Firebase Notification Debug Route */}
          <Route path="/firebase-notification-debug">
            <ProtectedRoute>
              <GlobalLayout><FirebaseNotificationDebug /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* 🔔 Push Debug Route */}
          <Route path="/push-debug">
            <ProtectedRoute>
              <GlobalLayout><PushDebug /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/fcm-test">
            <FcmTest />
          </Route>

          {/* 🤖 Android Push Test Route */}
          <Route path="/android-push-test">
            <ProtectedRoute>
              <GlobalLayout>
                {React.createElement(React.lazy(() => import('../pages/android-push-test')))}
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* 📱 Native Push Test Route (iOS + Android) */}
          <Route path="/native-push-test">
            <ProtectedRoute>
              <GlobalLayout>
                {React.createElement(React.lazy(() => import('../pages/native-push-test')))}
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* QR Routes REMOVED - rewards now handled by popup in map */}
          


          {/* Legal routes */}
          <Route path="/terms">
            <GlobalLayout><Terms /></GlobalLayout>
          </Route>
          
          <Route path="/privacy-policy">
            <GlobalLayout><PrivacyPolicy /></GlobalLayout>
          </Route>
          
          <Route path="/cookie-policy">
            <GlobalLayout><CookiePolicy /></GlobalLayout>
          </Route>
          
          <Route path="/safecreative">
            <GlobalLayout><SafeCreative /></GlobalLayout>
          </Route>
          
          <Route path="/game-rules">
            <GlobalLayout><GameRules /></GlobalLayout>
          </Route>

          {/* Contact route */}
          <Route path="/contact">
            <GlobalLayout><Contact /></GlobalLayout>
          </Route>

          {/* SMOKE TEST - Can be removed at any time */}
          <Route path="/billing-smoke-test">
            {React.createElement(React.lazy(() => import('@/pages/BillingSmokeTest')))}
          </Route>

          {/* DEV SETUP - Stripe Keys Configuration (URL-only access) */}
          <Route path="/dev-stripe-setup">
            {React.createElement(React.lazy(() => import('@/pages/DevStripeKeysSetup')))}
          </Route>

          {/* Plan selection route - accessible even without plan selected */}
          <Route path="/choose-plan">
            {isAuthenticated ? (
              <GlobalLayout><ChoosePlanPage /></GlobalLayout>
            ) : (
              <Login />
            )}
          </Route>

          {/* Subscription verification route */}
          <Route path="/subscription-verify">
            {isAuthenticated ? (
              <SubscriptionVerify />
            ) : (
              <Login />
            )}
          </Route>

          {/* Mission intro route - Post-login animation - NO ProtectedRoute to avoid loops */}
          <Route path="/mission-intro">
            <MissionIntroPage />
          </Route>

          {/* Auth routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/auth/reset" component={ResetPasswordPage} />

          {/* 404 fallback */}
          <Route>
            <GlobalLayout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">404 - Pagina non trovata</h1>
                  <button onClick={() => window.location.href = '/home'}>
                    Torna alla Home
                  </button>
                </div>
              </div>
            </GlobalLayout>
          </Route>
        </Switch>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default WouterRoutes;