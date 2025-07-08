import { LucideIcon } from 'lucide-react';

export interface NavigationLink {
  icon: React.ReactNode;
  label: string;
  path: string;
  isSpecial?: boolean;
  badge?: boolean;
  disabled?: boolean;
}

export interface NavigationState {
  currentPath: string;
  isVisible: boolean;
  unreadCount: number;
  buzzActive: boolean;
}

export interface BottomNavigationProps {
  className?: string;
  onTabChange?: (path: string) => void;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  color?: string;
  specialEffect?: boolean;
  requiresAuth?: boolean;
}

export type NavigationTheme = 'dark' | 'light' | 'auto';

export interface NavigationSettings {
  theme: NavigationTheme;
  showLabels: boolean;
  enableAnimations: boolean;
  buzzEffects: boolean;
  soundEnabled: boolean;
}