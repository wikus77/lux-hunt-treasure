// FILE CREATO — BY JOSEPH MULE
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsEmptyStateProps {
  onReload: () => void;
}

export const NotificationsEmptyState: React.FC<NotificationsEmptyStateProps> = ({ onReload }) => {
  return (
    <div className="text-center text-gray-500 py-8">
      <Bell className="w-12 h-12 mx-auto mb-4 text-white/30" />
      <p className="text-lg">Nessuna notifica da visualizzare</p>
      <p className="text-sm text-white/40 mt-2">Le tue notifiche appariranno qui</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReload}
        className="mt-4"
      >
        Ricarica notifiche
      </Button>
    </div>
  );
};