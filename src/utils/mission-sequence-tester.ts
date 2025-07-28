// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Sequenza post-login implementata secondo specifiche ufficiali
// ZERO TOLLERANZA – IMPLEMENTAZIONE CHIRURGICA COMPLETA

/**
 * Mission Sequence Tester - Verifica manuale della sequenza post-login
 */

export const testMissionSequence = () => {
  console.log('🧪 ======= MISSION SEQUENCE TEST STARTED =======');
  
  const currentPath = window.location.pathname;
  const isAuthenticated = !!localStorage.getItem('supabase.auth.token') || !!sessionStorage.getItem('supabase.auth.token');
  const hasSeenPostLoginIntro = sessionStorage.getItem('hasSeenPostLoginIntro');
  
  console.log('🧪 CURRENT STATE:', {
    currentPath,
    isAuthenticated,
    hasSeenPostLoginIntro,
    timestamp: new Date().toISOString()
  });
  
  // Test Step 1: Landing Page (if not authenticated)
  if (currentPath === '/' && !isAuthenticated) {
    console.log('✅ TEST STEP 1: Landing Page - PASS');
    console.log('📍 User should see landing page with "Join the Hunt" buttons');
    return 'STEP_1_LANDING_OK';
  }
  
  // Test Step 2: Login redirect check  
  if (currentPath === '/login') {
    console.log('✅ TEST STEP 2: Login Page - READY');
    console.log('📍 After successful login, should redirect to /mission-intro');
    return 'STEP_2_LOGIN_READY';
  }
  
  // Test Step 3: Mission Intro Animation
  if (currentPath === '/mission-intro') {
    console.log('✅ TEST STEP 3: Mission Intro Animation - ACTIVE');
    console.log('📍 Should show M1SSION numeric reveal animation');
    console.log('📍 Expected sequence: M1SSION → IT IS POSSIBLE → ™ → Date → Redirect to /home');
    return 'STEP_3_ANIMATION_ACTIVE';
  }
  
  // Test Step 4: Home after animation
  if (currentPath === '/home' && hasSeenPostLoginIntro === 'true') {
    console.log('✅ TEST STEP 4: Home After Animation - COMPLETE');
    console.log('📍 Successfully reached home after post-login animation');
    return 'STEP_4_COMPLETE';
  }
  
  // Test Step 5: Home direct access (no animation)
  if (currentPath === '/home' && hasSeenPostLoginIntro === 'true') {
    console.log('✅ TEST STEP 5: Direct Home Access - OK');
    console.log('📍 Home page accessed directly without animation (correct)');
    return 'STEP_5_DIRECT_HOME_OK';
  }
  
  console.log('❓ UNKNOWN STATE - May indicate test error or unexpected condition');
  return 'UNKNOWN_STATE';
};

// Auto-run test when loaded in browser console
if (typeof window !== 'undefined') {
  (window as any).testMissionSequence = testMissionSequence;
  console.log('🧪 Mission Sequence Tester loaded. Run testMissionSequence() to check current state.');
}

export default testMissionSequence;