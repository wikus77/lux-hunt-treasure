import { useState, useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

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

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 4000,
    action
  }: Toast) => {
    const id = Math.random().toString(36).substr(2, 9);

    switch (variant) {
      case 'destructive':
        sonnerToast.error(title || description || 'Errore', {
          description: title ? description : undefined,
          duration,
        });
        break;
      default:
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