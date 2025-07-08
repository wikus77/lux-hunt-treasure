import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  currentTab: string;
  previousTab: string | null;
  tabHistory: string[];
  buzzNotificationCount: number;
  gameProgress: Record<string, number>;
  setCurrentTab: (tab: string) => void;
  addToHistory: (tab: string) => void;
  setBuzzNotificationCount: (count: number) => void;
  updateGameProgress: (gameId: string, progress: number) => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      currentTab: '/home',
      previousTab: null,
      tabHistory: ['/home'],
      buzzNotificationCount: 0,
      gameProgress: {},

      setCurrentTab: (tab: string) => {
        const { currentTab: prev } = get();
        set({ 
          currentTab: tab, 
          previousTab: prev 
        });
      },

      addToHistory: (tab: string) => {
        const { tabHistory } = get();
        const newHistory = [...tabHistory, tab];
        // Keep only last 10 items
        if (newHistory.length > 10) {
          newHistory.shift();
        }
        set({ tabHistory: newHistory });
      },

      setBuzzNotificationCount: (count: number) => {
        set({ buzzNotificationCount: count });
      },

      updateGameProgress: (gameId: string, progress: number) => {
        const { gameProgress } = get();
        set({ 
          gameProgress: { 
            ...gameProgress, 
            [gameId]: progress 
          } 
        });
      },

      resetNavigation: () => {
        set({
          currentTab: '/home',
          previousTab: null,
          tabHistory: ['/home'],
          buzzNotificationCount: 0,
          gameProgress: {}
        });
      }
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        currentTab: state.currentTab,
        tabHistory: state.tabHistory,
        buzzNotificationCount: state.buzzNotificationCount,
        gameProgress: state.gameProgress
      })
    }
  )
);
