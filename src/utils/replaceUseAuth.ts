// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Utility to replace useAuth with useUnifiedAuth in files

export const filesToUpdate = [
  'src/components/AgentDiary.tsx',
  'src/components/Console.tsx', 
  'src/components/EmailVerificationFlow.tsx',
  'src/components/auth/debug-auth.tsx',
  'src/components/auth/login-form.tsx',
  'src/components/buzz/BuzzActionButton.tsx',
  'src/components/command-center/CommandCenterHome.tsx',
  'src/components/legal/CookieBanner.tsx',
  'src/components/legal/TermsBanner.tsx',
  'src/components/prizes/PrizeClueModal.tsx',
  'src/components/prizes/PrizeList.tsx',
  'src/components/profile/ProfileDropdown.tsx',
  'src/components/pwa/PushSetup.tsx',
  'src/components/settings/PrivacySettings.tsx',
  'src/hooks/buzz/useBuzzHandler.ts',
  'src/hooks/useAppInitialization.ts',
  'src/hooks/useBuzzStats.ts',
  'src/hooks/useLegalConsent.ts',
  'src/hooks/useMissionStatus.ts',
  'src/hooks/usePrizeData.ts',
  'src/pages/LeaderboardPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/NotificationsPage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/admin/SendNotificationPage.tsx',
  'src/pages/map/components/BuzzButton.tsx',
  'src/pages/profile/PaymentsHistoryPage.tsx',
  'src/pages/settings/AgentProfileSettings.tsx',
  'src/pages/settings/LegalSettings.tsx',
  'src/pages/settings/MissionSettings.tsx',
  'src/pages/settings/NotificationsSettings.tsx',
  'src/pages/settings/PaymentSettings.tsx',
  'src/pages/settings/SecuritySettings.tsx',
  'src/pages/settings/SettingsPage.tsx',
  'src/routes/AppRoutes.tsx'
];

export const replacements = [
  {
    find: "import { useAuth } from '@/hooks/use-auth';",
    replace: "import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';"
  },
  {
    find: "useAuth()",
    replace: "useUnifiedAuth()"
  }
];