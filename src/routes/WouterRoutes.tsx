// @ts-nocheck
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
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";

// © 2025 M1SSION™ – Dev-only routes flag
const IS_DEV = import.meta.env.DEV;
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useQueryQRRedirect } from "@/hooks/useQueryQRRedirect";
import { shouldShowLanding, markFirstVisitCompleted } from "@/utils/firstVisitUtils";
import { supabase } from "@/integrations/supabase/client";


// Static imports for Capacitor iOS compatibility
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import { PageSkeleton } from "@/components/ui/skeleton-loader";

// Intel module components
import CoordinateSelector from '@/components/intelligence/CoordinateSelector';
import ClueJournal from '@/components/intelligence/ClueJournal';
import ClueArchive from '@/components/intelligence/ClueArchive';
import GeoRadarTool from '@/components/intelligence/GeoRadarTool';
import BuzzInterceptor from '@/components/intelligence/BuzzInterceptor';
import FinalShotPage from '@/components/intelligence/FinalShotPage';
import IntelModuleHeader from '@/components/intelligence/IntelModuleHeader';
import AppHome from "@/pages/AppHome";
import LivingMap3D from "@/pages/LivingMap3D";
import { BuzzPage } from "@/pages/BuzzPage";
import IntelligenceStyledPage from "@/pages/IntelligenceStyledPage";
import IntelligencePage from "@/pages/IntelligencePage";
import IntelligenceRAG from "@/pages/IntelligenceRAG";
import IntelligenceAnswerTest from "@/pages/IntelligenceAnswerTest";
import HallOfWinnersStyledPage from "@/pages/HallOfWinnersStyledPage";
import HallOfWinners from "@/pages/HallOfWinners";
import LeaderboardPage from "@/pages/LeaderboardPage";
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
import BattleTest from "@/pages/BattleTest";
import AppInfoSettings from "@/pages/settings/AppInfoSettings";
import DiagnosticsSettings from "@/pages/settings/DiagnosticsSettings";
import PrivacyPermissionsSettings from "@/pages/settings/PrivacyPermissionsSettings";
import Subscriptions from "@/pages/Subscriptions";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
// © 2025 M1SSION™ – Lazy-loaded Admin/Panel pages for bundle optimization
const SendNotificationPage = React.lazy(() => import("@/pages/admin/SendNotificationPage"));
const MissionPanelPage = React.lazy(() => import("@/pages/admin/MissionPanelPage"));
const PulseLab = React.lazy(() => import("@/pages/admin/PulseLab"));
const PushTestPage = React.lazy(() => import("@/pages/PushTestPage"));
const AdminPushConsolePage = React.lazy(() => import("@/pages/push/AdminPushConsolePage"));
const PushSenderPanel = React.lazy(() => import("@/pages/panel/PushSenderPanel"));
const NotificationDebug = React.lazy(() => import("@/pages/NotificationDebug"));
const PanelAccessPage = React.lazy(() => import("@/pages/PanelAccessPage"));
const PushDiagnosi = React.lazy(() => import("@/pages/PushDiagnosi"));
const PanelUsersPage = React.lazy(() => import("@/pages/PanelUsersPage"));
const BulkMarkerDropPage = React.lazy(() => import("@/pages/panel/BulkMarkerDropPage"));
const MarkerRewardsPage = React.lazy(() => import("@/pages/panel/MarkerRewardsPage"));
const NorahAdmin = React.lazy(() => import("@/pages/panel/NorahAdmin"));
const DiagSupabase = React.lazy(() => import("@/pages/DiagSupabase"));
const SupabaseConnectionTest = React.lazy(() => import("@/pages/SupabaseConnectionTest"));
const PushTest = React.lazy(() => import("@/pages/debug/PushTest"));
import DNAPage from "@/pages/DNAPage";
const PushDiagnostic = React.lazy(() => import("@/pages/debug/PushDiagnostic"));
const M1ssionPushTest = React.lazy(() => import("@/pages/M1ssionPushTest"));
const M1ssionDebugTest = React.lazy(() => import("@/pages/M1ssionDebugTest").then(m => ({ default: m.M1ssionDebugTest })));
const FirebaseNotificationDebug = React.lazy(() => import("@/pages/firebase-notification-debug"));
const PushHealth = React.lazy(() => import("@/pages/PushHealth"));
const PushDebug = React.lazy(() => import("@/pages/PushDebug"));
const PushReport = React.lazy(() => import("@/pages/PushReport").then(m => ({ default: m.PushReport })));
// QR pages removed - rewards now handled by popup in map
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
const OnboardingSandbox = React.lazy(() => import("@/pages/OnboardingSandbox"));

import Terms from "@/pages/Terms";
import TermsConditions from "@/pages/legal/TermsConditions";
import PrivacyPolicyComplete from "@/pages/legal/PrivacyPolicyComplete";
import CookiePolicyComplete from "@/pages/legal/CookiePolicyComplete";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafeCreative from "@/pages/SafeCreative";
import GameRulesComplete from "@/pages/legal/GameRulesComplete";
import Policies from "@/pages/legal/Policies";
import GamePoliciesIt from "@/pages/legal/GamePolicies.it";

// Subscription plan pages
import SilverPlanPage from "@/pages/subscriptions/SilverPlanPage";
import GoldPlanPage from "@/pages/subscriptions/GoldPlanPage";
import BlackPlanPage from "@/pages/subscriptions/BlackPlanPage";
import TitaniumPlanPage from "@/pages/subscriptions/TitaniumPlanPage";
import ChoosePlanPage from "@/pages/ChoosePlanPage";
import SubscriptionVerify from "@/pages/SubscriptionVerify";
import MissionIntroPage from "@/pages/MissionIntroPage";
const FcmTest = React.lazy(() => import("@/pages/FcmTest"));
const DevPushTest = React.lazy(() => import("@/pages/dev/PushTest"));

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

  // Debug logs only in development
  if (import.meta.env.DEV) {
    console.log('🔍 WOUTER ROUTING STATE DEBUG:', {
      isAuthenticated,
      isLoading,
      isCapacitorApp,
      currentPath: window.location.pathname,
      userExists: !!isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Switch>
          {/* ✅ QR routes - redirected to main app with marker rewards popup */}

          {/* Landing page - FAIL-OPEN FIRST VISIT LOGIC */}
          <Route path="/">
            {isLoading ? (
              <PageSkeleton variant="default" />
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

          {/* Landing Page - Always accessible */}
          <Route path="/landing">
            <LandingPage />
          </Route>

          {/* Protected routes */}
          <Route path="/home">
            <ProtectedRoute>
              <GlobalLayout><AppHome /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* MapTiler 3D Sandbox - Neon Style */}
          <Route path="/map-3d-tiler">
            <ProtectedRoute>
              <GlobalLayout>
                <React.Suspense fallback={<PageSkeleton variant="map" />}>
                  {React.createElement(React.lazy(() => import('@/pages/sandbox/MapTiler3D')))}
                </React.Suspense>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Buzz Map alias - redirects to map-3d-tiler */}
          <Route path="/buzz-map">
            <ProtectedRoute>
              <GlobalLayout>
                <React.Suspense fallback={<PageSkeleton variant="map" />}>
                  {React.createElement(React.lazy(() => import('@/pages/sandbox/MapTiler3D')))}
                </React.Suspense>
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Living Map 3D - Route Alias */}
          <Route path="/living-map-3d">
            <ProtectedRoute>
              <GlobalLayout>
                <LivingMap3D />
              </GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/buzz">
            <ProtectedRoute>
              <GlobalLayout><BuzzPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence">
            <ProtectedRoute>
              <GlobalLayout>
                <IntelligencePage />
              </GlobalLayout>
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

          <Route path="/battle-test">
            <ProtectedRoute>
              <BattleTest />
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
              <GlobalLayout><LeaderboardPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/winners">
            <ProtectedRoute>
              <GlobalLayout><HallOfWinners /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/notifications">
            <GlobalLayout><Notifications /></GlobalLayout>
          </Route>

          <Route path="/profile">
            {() => {
              // Redirect to /settings/agent-profile
              if (typeof window !== 'undefined') {
                window.location.href = '/settings/agent-profile';
              }
              return null;
            }}
          </Route>

          <Route path="/settings">
            <ProtectedRoute>
              <GlobalLayout><SettingsPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* DNA Route - M1SSION DNA™ */}
          <Route path="/dna">
            <ProtectedRoute>
              <DNAPage />
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

          {/* Admin routes - Protected with AdminProtectedRoute + Lazy loaded */}
          <Route path="/admin/send-notification">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <SendNotificationPage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/admin/mission-panel">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <MissionPanelPage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/admin/pulse-lab">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <PulseLab />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/push">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <AdminPushConsolePage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/push-sender">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <PushSenderPanel />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          {/* Push Console routes - Admin only */}
          <Route path="/panel/push-admin">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                {React.createElement(React.lazy(() => import('../pages/push/AdminPushConsolePage')))}
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/push">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                {React.createElement(React.lazy(() => import('../pages/push/UserPushConsolePage')))}
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          {/* ========================================== */}
          {/* DEV/DEBUG ROUTES - Only available in DEV mode */}
          {/* In production, these routes will not exist */}
          {/* ========================================== */}
          {IS_DEV && (
            <>
              {/* Dev diagnostics route */}
              <Route path="/dev/markers-healthcheck">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <MarkersHealthcheck />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Dev Push Test Panel */}
              <Route path="/dev/push-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <DevPushTest />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Push Test Route */}
              <Route path="/push-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <PushTestPage />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Unified Push Test Route */}
              <Route path="/unified-push-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout>
                      <PushTestPage />
                    </GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>
              
              <Route path="/push-health">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout>
                      <PushHealth />
                    </GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Notification Debug Route */}
              <Route path="/notification-debug">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><NotificationDebug /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Debug Push Test Route */}
              <Route path="/debug/pushtest">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <PushTest />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Push Diagnostic Route */}
              <Route path="/debug/push">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><PushDiagnostic /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>
              
              {/* Push Debug Console */}
              <Route path="/push-debug">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><PushDebug /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Push Report Dashboard */}
              <Route path="/push-report">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><PushReport /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* M1SSION Pipeline Test Route */}
              <Route path="/debug/m1ssion-push-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><M1ssionPushTest /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* M1SSION Emergency Debug */}
              <Route path="/debug/raw-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><M1ssionDebugTest /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* M1SSION Debug Alternative */}
              <Route path="/raw-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <M1ssionDebugTest />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>
            </>
          )}

          {/* Panel Access route - Admin only + Lazy loaded */}
          <Route path="/panel-access">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <GlobalLayout><PanelAccessPage /></GlobalLayout>
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel-users">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <PanelUsersPage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/bulk-marker-drop">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <BulkMarkerDropPage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/marker-rewards">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <MarkerRewardsPage />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/norah">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <NorahAdmin />
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          {/* Dev/Test routes - only in development */}
          {IS_DEV && (
            <>
              <Route path="/diag-supabase">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <DiagSupabase />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Onboarding Sandbox - Test Tutorial */}
              <Route path="/onboarding-sandbox">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <OnboardingSandbox />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              <Route path="/supabase-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <SupabaseConnectionTest />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>
            </>
          )}

          <Route path="/panel/push-control">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <GlobalLayout><PanelAccessPage /></GlobalLayout>
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          <Route path="/panel/push-preflight">
            <AdminProtectedRoute>
              <React.Suspense fallback={<PageSkeleton variant="default" />}>
                <GlobalLayout><PanelAccessPage /></GlobalLayout>
              </React.Suspense>
            </AdminProtectedRoute>
          </Route>

          {/* More dev/debug routes - only in development */}
          {IS_DEV && (
            <>
              {/* Push Diagnostica Route */}
              <Route path="/push-diagnosi">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <PushDiagnosi />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Firebase Notification Debug Route */}
              <Route path="/firebase-notification-debug">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><FirebaseNotificationDebug /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              {/* Push Debug Route (duplicate, kept for compatibility) */}
              <Route path="/push-debug">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <GlobalLayout><PushDebug /></GlobalLayout>
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>

              <Route path="/fcm-test">
                <AdminProtectedRoute>
                  <React.Suspense fallback={<PageSkeleton variant="default" />}>
                    <FcmTest />
                  </React.Suspense>
                </AdminProtectedRoute>
              </Route>
            </>
          )}

          {/* Native platform debug routes - only in development */}
          {IS_DEV && (
            <>
              {/* Android Push Test Route */}
              <Route path="/android-push-test">
                <AdminProtectedRoute>
                  <GlobalLayout>
                    {React.createElement(React.lazy(() => import('../pages/android-push-test')))}
                  </GlobalLayout>
                </AdminProtectedRoute>
              </Route>

              {/* Native Push Test Route (iOS + Android) */}
              <Route path="/native-push-test">
                <AdminProtectedRoute>
                  <GlobalLayout>
                    {React.createElement(React.lazy(() => import('../pages/native-push-test')))}
                  </GlobalLayout>
                </AdminProtectedRoute>
              </Route>
            </>
          )}

          {/* QR Routes REMOVED - rewards now handled by popup in map */}
          


          {/* Legal routes */}
          <Route path="/terms">
            <GlobalLayout><TermsConditions /></GlobalLayout>
          </Route>
          
          <Route path="/terms-conditions">
            <GlobalLayout><TermsConditions /></GlobalLayout>
          </Route>
          
          <Route path="/privacy-policy">
            <GlobalLayout><PrivacyPolicyComplete /></GlobalLayout>
          </Route>
          
          <Route path="/cookie-policy">
            <GlobalLayout><CookiePolicyComplete /></GlobalLayout>
          </Route>
          
          <Route path="/safecreative">
            <GlobalLayout><SafeCreative /></GlobalLayout>
          </Route>
          
          <Route path="/game-rules">
            <GlobalLayout><GameRulesComplete /></GlobalLayout>
          </Route>
          
          <Route path="/policies">
            <GlobalLayout><Policies /></GlobalLayout>
          </Route>
          
          <Route path="/game-policies">
            <GlobalLayout><Policies /></GlobalLayout>
          </Route>
          
          <Route path="/game-policies-it">
            <GlobalLayout><GamePoliciesIt /></GlobalLayout>
          </Route>

          {/* Contact route */}
          <Route path="/contact">
            <GlobalLayout><Contact /></GlobalLayout>
          </Route>

          {/* Dev-only billing and setup routes */}
          {IS_DEV && (
            <>
              {/* SMOKE TEST - Can be removed at any time */}
              <Route path="/billing-smoke-test">
                <AdminProtectedRoute>
                  {React.createElement(React.lazy(() => import('@/pages/BillingSmokeTest')))}
                </AdminProtectedRoute>
              </Route>

              {/* DEV SETUP - Stripe Keys Configuration */}
              <Route path="/dev-stripe-setup">
                <AdminProtectedRoute>
                  {React.createElement(React.lazy(() => import('@/pages/DevStripeKeysSetup')))}
                </AdminProtectedRoute>
              </Route>
            </>
          )}

          {/* Plan selection route - accessible even without plan selected */}
          <Route path="/choose-plan">
            {isLoading ? (
              <PageSkeleton variant="default" />
            ) : isAuthenticated ? (
              <GlobalLayout><ChoosePlanPage /></GlobalLayout>
            ) : (
              <Login />
            )}
          </Route>

          {/* Subscription verification route */}
          <Route path="/subscription-verify">
            {isLoading ? (
              <PageSkeleton variant="default" />
            ) : isAuthenticated ? (
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