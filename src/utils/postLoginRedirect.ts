// M1SSION™ - Post Login Redirect Logic for iOS Capacitor
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { detectCapacitorEnvironment, preserveFunctionName } from '@/utils/iosCapacitorFunctions';

export interface PostLoginOptions {
  navigate: NavigateFunction;
  defaultRoute?: string;
  skipProfileCheck?: boolean;
  forceRoute?: string;
}

export interface ProfileData {
  id: string;
  email: string;
  full_name?: string;
  agent_code?: string;
  role: string;
  subscription_tier: string;
  credits: number;
  avatar_url?: string;
}

/**
 * Handles post-login redirect logic for M1SSION™ iOS Capacitor app
 */
export const handlePostLoginRedirect = preserveFunctionName(async (options: PostLoginOptions) => {
  const { navigate, defaultRoute = '/home', skipProfileCheck = false, forceRoute } = options;
  const isCapacitor = detectCapacitorEnvironment();

  console.log('🔄 Post-login redirect:', {
    defaultRoute,
    skipProfileCheck,
    forceRoute,
    isCapacitor
  });

  try {
    // If force route is specified, navigate there immediately
    if (forceRoute) {
      console.log('🎯 Force navigating to:', forceRoute);
      navigate(forceRoute, { replace: true });
      return;
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ No user found during post-login redirect');
      navigate('/login', { replace: true });
      return;
    }

    // Skip profile check if requested
    if (skipProfileCheck) {
      console.log('⏭️ Skipping profile check, navigating to:', defaultRoute);
      navigate(defaultRoute, { replace: true });
      return;
    }

    // Get user profile data
    const profileData = await getUserProfile(user.id);
    
    if (!profileData) {
      console.log('👤 No profile found, creating...');
      await createInitialProfile(user);
      navigate('/home', { replace: true });
      return;
    }

    // Determine redirect based on profile state
    const redirectRoute = await determineRedirectRoute(profileData, user);
    
    console.log('📍 Final redirect route:', redirectRoute);
    navigate(redirectRoute, { replace: true });

    // iOS specific optimizations
    if (isCapacitor) {
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      // Clear any navigation history to prevent back button issues
      window.history.replaceState(null, '', redirectRoute);
    }

  } catch (error) {
    console.error('💥 Error in post-login redirect:', error);
    navigate(defaultRoute, { replace: true });
  }
}, 'handlePostLoginRedirect');

/**
 * Get user profile data from Supabase
 */
const getUserProfile = preserveFunctionName(async (userId: string): Promise<ProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }

    return data as ProfileData;
  } catch (error) {
    console.error('💥 Exception in getUserProfile:', error);
    return null;
  }
}, 'getUserProfile');

/**
 * Create initial profile for new users
 */
const createInitialProfile = preserveFunctionName(async (user: any): Promise<void> => {
  try {
    const agentCode = generateAgentCode();
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agente',
        agent_code: agentCode,
        role: 'user',
        subscription_tier: 'free',
        credits: 100 // Starting credits
      });

    if (error) {
      console.error('❌ Error creating profile:', error);
      throw error;
    }

    console.log('✅ Profile created successfully with agent code:', agentCode);
  } catch (error) {
    console.error('💥 Exception in createInitialProfile:', error);
    throw error;
  }
}, 'createInitialProfile');

/**
 * Determine the appropriate redirect route based on profile state
 */
const determineRedirectRoute = preserveFunctionName(async (
  profile: ProfileData, 
  user: any
): Promise<string> => {
  
  // Admin/Developer users go to admin dashboard
  if (profile.role === 'admin' || profile.role === 'developer') {
    console.log('👑 Admin/Developer user detected');
    return '/admin';
  }

  // Check if user needs to complete profile setup
  if (!profile.full_name || !profile.agent_code) {
    console.log('📝 Profile incomplete, redirecting to setup');
    return '/profile';
  }

  // Check for email verification (if required)
  if (!user.email_confirmed_at) {
    console.log('📧 Email not verified');
    // For M1SSION™, we might want to redirect to verification page
    // return '/verify-email';
  }

  // Check subscription status for premium features
  if (profile.subscription_tier === 'free' && profile.credits <= 0) {
    console.log('💰 Low credits, might suggest subscription');
    // Could redirect to subscription page or show home with upgrade prompts
  }

  // Check for pending missions or special states
  const specialRoute = await checkSpecialRedirectConditions(profile);
  if (specialRoute) {
    return specialRoute;
  }

  // Default to home
  console.log('🏠 Redirecting to home');
  return '/home';
}, 'determineRedirectRoute');

/**
 * Check for special redirect conditions (missions, events, etc.)
 */
const checkSpecialRedirectConditions = preserveFunctionName(async (
  profile: ProfileData
): Promise<string | null> => {
  
  try {
    // Check for active missions that require immediate attention
    const { data: activeMissions } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'active')
      .order('publication_date', { ascending: false })
      .limit(1);

    // If there's a new mission and user hasn't seen it
    if (activeMissions && activeMissions.length > 0) {
      const mission = activeMissions[0];
      // Check if user has interacted with this mission
      // This could be stored in user preferences or mission logs
      
      // For now, just return null (no special redirect)
    }

    // Check for urgent app messages
    const { data: urgentMessages } = await supabase
      .from('app_messages')
      .select('*')
      .eq('is_active', true)
      .eq('message_type', 'urgent')
      .not('is_read', 'eq', true)
      .limit(1);

    if (urgentMessages && urgentMessages.length > 0) {
      // Could redirect to notifications page to show urgent message
      return '/notifications';
    }

    return null;
  } catch (error) {
    console.error('💥 Error checking special conditions:', error);
    return null;
  }
}, 'checkSpecialRedirectConditions');

/**
 * Generate a unique agent code
 */
const generateAgentCode = (): string => {
  const prefix = 'AG-';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = prefix;
  
  // Add 2 random letters
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
};

/**
 * Handle logout redirect
 */
export const handleLogoutRedirect = preserveFunctionName(async (navigate: NavigateFunction) => {
  const isCapacitor = detectCapacitorEnvironment();
  
  console.log('🚪 Handling logout redirect');
  
  try {
    // Clear any local storage data
    localStorage.removeItem('developer_access');
    localStorage.removeItem('developer_user');
    localStorage.removeItem('paymentRedirected');
    
    // Supabase logout
    await supabase.auth.signOut();
    
    // Navigate to login
    navigate('/login', { replace: true });
    
    // iOS specific cleanup
    if (isCapacitor) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        window.history.replaceState(null, '', '/login');
      }, 100);
    }
    
  } catch (error) {
    console.error('💥 Error during logout:', error);
    navigate('/login', { replace: true });
  }
}, 'handleLogoutRedirect');

/**
 * Handle access denied redirect
 */
export const handleAccessDeniedRedirect = preserveFunctionName((
  navigate: NavigateFunction,
  reason: string = 'insufficient_permissions'
) => {
  console.log('🚫 Access denied redirect:', reason);
  
  const queryParams = new URLSearchParams({
    reason,
    redirect: window.location.pathname
  });
  
  navigate(`/access-denied?${queryParams.toString()}`, { replace: true });
}, 'handleAccessDeniedRedirect');

export default {
  handlePostLoginRedirect,
  handleLogoutRedirect,
  handleAccessDeniedRedirect
};