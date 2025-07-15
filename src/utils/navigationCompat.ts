// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Navigation Compatibility Layer
import React from 'react';
import { useNavigationStore } from '@/stores/navigationStore';

export const useNavigateCompat = () => {
  const { setCurrentPage } = useNavigationStore();
  return (path: string) => setCurrentPage(path);
};

export const useLocationCompat = () => {
  const { currentPage } = useNavigationStore();
  return { pathname: currentPage };
};