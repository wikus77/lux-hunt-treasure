// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { Award } from 'lucide-react';

interface BadgeUnlockedNotificationProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string;
  onClose: () => void;
  onClick?: () => void;
}

export function BadgeUnlockedNotification({
  badgeName,
  badgeDescription,
  badgeIcon,
  onClose,
  onClick
}: BadgeUnlockedNotificationProps) {
  
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-auto"
      role="button"
      tabIndex={0}
      onClick={() => { onClick?.(); onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick?.(); onClose(); } }}
      aria-label="Apri premio sbloccato"
    >
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-accent/20 p-8 rounded-2xl shadow-2xl border-2 border-primary/50 backdrop-blur-md">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
        <div className="relative flex flex-col items-center text-center gap-4">
          <div className="bg-primary/20 p-6 rounded-full">
            {badgeIcon ? (
              <span className="text-6xl">{badgeIcon}</span>
            ) : (
              <Award className="h-16 w-16 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">🎖️ BADGE SBLOCCATO!</h2>
            <p className="text-xl font-semibold">{badgeName}</p>
            <p className="text-sm text-muted-foreground max-w-xs">{badgeDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
