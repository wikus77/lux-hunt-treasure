// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Hook di compatibilità per sostituire useNavigate temporaneamente

import { useNavigationStore } from '@/stores/navigationStore';

/**
 * Hook di compatibilità che emula useNavigate ma usa Zustand
 * Risolve il problema dello schermo nero causato da react-router-dom
 */
export const useNavigateCompat = () => {
  const { navigateToPage } = useNavigationStore();

  const navigate = (path: string | number, options?: { replace?: boolean }) => {
    if (typeof path === 'string') {
      console.log('🔄 NavigateCompat: Navigating to:', path, options?.replace ? '(replace)' : '');
      console.log('🔄 NavigateCompat: Current store state before nav:', useNavigationStore.getState().currentTab);
      navigateToPage(path);
      setTimeout(() => {
        console.log('🔄 NavigateCompat: Current store state after nav:', useNavigationStore.getState().currentTab);
      }, 100);
    } else if (typeof path === 'number') {
      // Gestione del back (-1)
      if (path === -1) {
        const { goBack } = useNavigationStore.getState();
        const previousPath = goBack();
        console.log('🔄 NavigateCompat: Going back to:', previousPath);
      }
    }
  };

  return navigate;
};

// Alias per sostituzioni rapide
export const useNavigate = useNavigateCompat;