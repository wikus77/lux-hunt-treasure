// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Enhanced Toast with Debouncing
import { useState, useCallback, useRef } from 'react';
import { toast as sonnerToast } from 'sonner';
import { hapticSuccess, hapticError } from '@/utils/haptics';

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Debounce duplicate toasts
  const recentToasts = useRef<Set<string>>(new Set());

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 4000,
    action
  }: Toast) => {
    const content = title || description || '';
    const toastKey = `${variant}-${content}`;
    
    // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Prevent duplicate toasts
    if (recentToasts.current.has(toastKey)) {
      return { id: '', dismiss: () => {}, update: () => {} };
    }
    
    recentToasts.current.add(toastKey);
    setTimeout(() => {
      recentToasts.current.delete(toastKey);
    }, 2000); // Prevent duplicates for 2 seconds

    const id = Math.random().toString(36).substr(2, 9);

    switch (variant) {
      case 'destructive':
        hapticError(); // Vibrazione per errore
        sonnerToast.error(title || description || 'Errore', {
          description: title ? description : undefined,
          duration,
        });
        break;
      default:
        hapticSuccess(); // Vibrazione per successo
        sonnerToast.success(title || description || 'Successo', {
          description: title ? description : undefined,
          duration,
        });
    }

    const newToast: Toast = { id, title, description, variant, duration, action };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
      update: (newToast: Partial<Toast>) => 
        setToasts(prev => prev.map(t => t.id === id ? { ...t, ...newToast } : t))
    };
  }, []);

  return { toast, toasts };
}

export { toast } from 'sonner';