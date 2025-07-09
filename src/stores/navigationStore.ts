// M1SSION™ - Navigation Store for iOS Capacitor Compatibility
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  currentTab: string;
  history: string[];
  isCapacitor: boolean;
  lastNavigation: number;
}

interface NavigationActions {
  setCurrentTab: (tab: string) => void;
  addToHistory: (path: string) => void;
  goBack: () => string | null;
  clearHistory: () => void;
  setCapacitorMode: (isCapacitor: boolean) => void;
  getNavigationInfo: () => NavigationState;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      // State
      currentTab: '/',
      history: ['/'],
      isCapacitor: false,
      lastNavigation: Date.now(),

      // Actions
      setCurrentTab: (tab: string) => {
        console.log('🏪 Navigation Store: Setting current tab to:', tab);
        set({ 
          currentTab: tab, 
          lastNavigation: Date.now() 
        });
      },

      addToHistory: (path: string) => {
        const { history } = get();
        const newHistory = [...history, path].slice(-10); // Keep last 10 entries
        console.log('🏪 Navigation Store: Adding to history:', path);
        set({ 
          history: newHistory, 
          lastNavigation: Date.now() 
        });
      },

      goBack: () => {
        const { history } = get();
        if (history.length > 1) {
          const newHistory = history.slice(0, -1);
          const previousPath = newHistory[newHistory.length - 1];
          set({ 
            history: newHistory, 
            currentTab: previousPath,
            lastNavigation: Date.now() 
          });
          console.log('🏪 Navigation Store: Going back to:', previousPath);
          return previousPath;
        }
        return null;
      },

      clearHistory: () => {
        console.log('🏪 Navigation Store: Clearing history');
        set({ 
          history: ['/'], 
          currentTab: '/',
          lastNavigation: Date.now() 
        });
      },

      setCapacitorMode: (isCapacitor: boolean) => {
        console.log('🏪 Navigation Store: Setting Capacitor mode:', isCapacitor);
        set({ 
          isCapacitor,
          lastNavigation: Date.now() 
        });
      },

      getNavigationInfo: () => {
        return get();
      },
    }),
    {
      name: 'm1ssion-navigation-store',
      partialize: (state) => ({
        currentTab: state.currentTab,
        history: state.history,
        isCapacitor: state.isCapacitor,
      }),
    }
  )
);

// Explicit helper functions for iOS Capacitor compatibility
export const navigationHelpers = {
  explicitSetTab: (tab: string) => {
    const store = useNavigationStore.getState();
    store.setCurrentTab(tab);
    return tab;
  },
  
  explicitAddHistory: (path: string) => {
    const store = useNavigationStore.getState();
    store.addToHistory(path);
    return path;
  },
  
  explicitGoBack: () => {
    const store = useNavigationStore.getState();
    return store.goBack();
  },

  getExplicitNavigationState: () => {
    const store = useNavigationStore.getState();
    return store.getNavigationInfo();
  },
};

console.log('✅ M1SSION Navigation Store initialized');