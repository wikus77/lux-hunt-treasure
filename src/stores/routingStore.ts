// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
// M1SSION™ Custom Routing System - Zustand Based Navigation
// Compatibilità Capacitor iOS al 100%

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth?: boolean;
  title?: string;
  layout?: 'global' | 'minimal' | 'none';
}

interface RoutingState {
  currentPath: string;
  history: string[];
  routes: Record<string, RouteConfig>;
  isCapacitor: boolean;
  lastNavigation: number;
}

interface RoutingActions {
  navigate: (path: string, replace?: boolean) => void;
  goBack: () => boolean;
  setCapacitorMode: (isCapacitor: boolean) => void;
  getRouteConfig: (path: string) => RouteConfig | null;
  registerRoute: (config: RouteConfig) => void;
  getCurrentPath: () => string;
}

type RoutingStore = RoutingState & RoutingActions;

// Definizione completa delle route M1SSION™
const defaultRoutes: Record<string, RouteConfig> = {
  '/': { 
    path: '/', 
    component: 'Index', 
    title: 'M1SSION™ - Hunt Your Prize',
    layout: 'none'
  },
  '/home': { 
    path: '/home', 
    component: 'AppHome', 
    requiresAuth: true, 
    title: 'Command Center',
    layout: 'global'
  },
  '/map': { 
    path: '/map', 
    component: 'Map', 
    requiresAuth: true, 
    title: 'Tactical Map',
    layout: 'global'
  },
  '/buzz': { 
    path: '/buzz', 
    component: 'BuzzPage', 
    requiresAuth: true, 
    title: 'BUZZ Intelligence',
    layout: 'global'
  },
  '/games': { 
    path: '/games', 
    component: 'Games', 
    requiresAuth: true, 
    title: 'Mission Games',
    layout: 'global'
  },
  '/leaderboard': { 
    path: '/leaderboard', 
    component: 'Leaderboard', 
    requiresAuth: true, 
    title: 'Agent Rankings',
    layout: 'global'
  },
  '/notifications': { 
    path: '/notifications', 
    component: 'Notifications', 
    requiresAuth: false, 
    title: 'Intel Feed',
    layout: 'global'
  },
  '/profile': { 
    path: '/profile', 
    component: 'Profile', 
    requiresAuth: true, 
    title: 'Agent Profile',
    layout: 'global'
  },
  '/settings': { 
    path: '/settings', 
    component: 'SettingsPage', 
    requiresAuth: true, 
    title: 'System Settings',
    layout: 'global'
  },
  '/subscriptions': { 
    path: '/subscriptions', 
    component: 'Subscriptions', 
    requiresAuth: true, 
    title: 'Mission Tiers',
    layout: 'global'
  },
  '/login': { 
    path: '/login', 
    component: 'Login', 
    title: 'Agent Login',
    layout: 'minimal'
  },
  '/register': { 
    path: '/register', 
    component: 'Register', 
    title: 'Agent Registration',
    layout: 'minimal'
  },
  '/select-mission': { 
    path: '/select-mission', 
    component: 'MissionSelection', 
    title: 'Mission Selection',
    layout: 'minimal'
  },
  '/how-it-works': { 
    path: '/how-it-works', 
    component: 'HowItWorks', 
    title: 'Mission Briefing',
    layout: 'none'
  },
  '/contacts': { 
    path: '/contacts', 
    component: 'Contacts', 
    title: 'Contact HQ',
    layout: 'none'
  },
  '/privacy-policy': { 
    path: '/privacy-policy', 
    component: 'PrivacyPolicy', 
    title: 'Privacy Policy',
    layout: 'none'
  },
  '/terms': { 
    path: '/terms', 
    component: 'Terms', 
    title: 'Terms of Service',
    layout: 'none'
  },
  // Profile subpages - BY JOSEPH MULE
  '/profile/personal-info': { 
    path: '/profile/personal-info', 
    component: 'PersonalInfoPage', 
    requiresAuth: true, 
    title: 'Personal Information',
    layout: 'global'
  },
  '/profile/security': { 
    path: '/profile/security', 
    component: 'SecurityPage', 
    requiresAuth: true, 
    title: 'Security Settings',
    layout: 'global'
  },
  '/profile/payments': { 
    path: '/profile/payments', 
    component: 'PaymentsPage', 
    requiresAuth: true, 
    title: 'Payment Methods',
    layout: 'global'
  },
  // Subscription plan pages - BY JOSEPH MULE
  '/subscriptions/silver': { 
    path: '/subscriptions/silver', 
    component: 'SilverPlanPage', 
    requiresAuth: true, 
    title: 'Silver Tier',
    layout: 'global'
  },
  '/subscriptions/gold': { 
    path: '/subscriptions/gold', 
    component: 'GoldPlanPage', 
    requiresAuth: true, 
    title: 'Gold Tier',
    layout: 'global'
  },
  '/subscriptions/black': { 
    path: '/subscriptions/black', 
    component: 'BlackPlanPage', 
    requiresAuth: true, 
    title: 'Black Tier',
    layout: 'global'
  },
  // Legal Routes - BY JOSEPH MULE
  '/legal/terms': { 
    path: '/legal/terms', 
    component: 'LegalTerms', 
    title: 'Legal Terms',
    layout: 'none'
  },
  '/legal/privacy': { 
    path: '/legal/privacy', 
    component: 'Privacy', 
    title: 'Privacy Policy',
    layout: 'none'
  },
  '/legal/safecreative': { 
    path: '/legal/safecreative', 
    component: 'SafeCreative', 
    title: 'Safe Creative',
    layout: 'none'
  },
};

export const useRoutingStore = create<RoutingStore>()(
  persist(
    (set, get) => ({
      // State
      currentPath: '/',
      history: ['/'],
      routes: defaultRoutes,
      isCapacitor: false,
      lastNavigation: Date.now(),

      // Actions
      navigate: (path: string, replace = false) => {
        const { history, currentPath } = get();
        
        console.log('🧭 M1SSION ROUTING: Navigating to:', path, 'Replace:', replace);
        
        if (path === currentPath) {
          console.log('🧭 Already on path:', path);
          return;
        }

        let newHistory = [...history];
        
        if (replace) {
          newHistory[newHistory.length - 1] = path;
        } else {
          newHistory.push(path);
          // Keep only last 20 entries
          newHistory = newHistory.slice(-20);
        }
        
        set({ 
          currentPath: path, 
          history: newHistory,
          lastNavigation: Date.now() 
        });

        // Update browser URL without triggering page reload
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.pathname = path;
          window.history.pushState({}, '', url.toString());
          
          // Update page title
          const route = get().routes[path];
          if (route?.title) {
            document.title = `${route.title} - M1SSION™`;
          }
        }
      },

      goBack: () => {
        const { history } = get();
        if (history.length > 1) {
          const newHistory = history.slice(0, -1);
          const previousPath = newHistory[newHistory.length - 1];
          
          set({ 
            currentPath: previousPath,
            history: newHistory,
            lastNavigation: Date.now() 
          });
          
          // Update browser URL
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.pathname = previousPath;
            window.history.pushState({}, '', url.toString());
          }
          
          console.log('🧭 M1SSION ROUTING: Going back to:', previousPath);
          return true;
        }
        return false;
      },

      setCapacitorMode: (isCapacitor: boolean) => {
        console.log('🧭 M1SSION ROUTING: Setting Capacitor mode:', isCapacitor);
        set({ 
          isCapacitor,
          lastNavigation: Date.now() 
        });
      },

      getRouteConfig: (path: string) => {
        const { routes } = get();
        return routes[path] || null;
      },

      registerRoute: (config: RouteConfig) => {
        const { routes } = get();
        set({ 
          routes: { ...routes, [config.path]: config },
          lastNavigation: Date.now() 
        });
      },

      getCurrentPath: () => {
        return get().currentPath;
      },
    }),
    {
      name: 'm1ssion-routing-store',
      partialize: (state) => ({
        currentPath: state.currentPath,
        history: state.history,
        isCapacitor: state.isCapacitor,
      }),
    }
  )
);

// Helper functions for explicit navigation (iOS Capacitor compatibility)
export const routingHelpers = {
  explicitNavigate: (path: string, replace = false) => {
    const store = useRoutingStore.getState();
    store.navigate(path, replace);
    return path;
  },
  
  explicitGoBack: () => {
    const store = useRoutingStore.getState();
    return store.goBack();
  },
  
  getExplicitCurrentPath: () => {
    const store = useRoutingStore.getState();
    return store.getCurrentPath();
  },

  getExplicitRouteConfig: (path: string) => {
    const store = useRoutingStore.getState();
    return store.getRouteConfig(path);
  },
};

console.log('✅ M1SSION Custom Routing System initialized');
