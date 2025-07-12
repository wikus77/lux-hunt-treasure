// FILE CREATO — BY JOSEPH MULE
import React from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsHeaderProps {
  filter: 'all' | 'unread' | 'important';
  onFilterChange: (filter: 'all' | 'unread' | 'important') => void;
  onMarkAllAsRead: () => void;
  onManualReload: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  filter,
  onFilterChange,
  onMarkAllAsRead,
  onManualReload
}) => {
  return (
    <div className="glass-card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Le tue notifiche</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onManualReload}>
            <Bell className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Segna tutto come letto
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 overflow-x-auto mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="flex-shrink-0"
        >
          <Bell className="w-4 h-4 mr-2" />
          Tutte
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('unread')}
          className="flex-shrink-0"
        >
          <Bell className="w-4 h-4 mr-2" />
          Non lette
        </Button>
        <Button
          variant={filter === 'important' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('important')}
          className="flex-shrink-0"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Importanti
        </Button>
      </div>
    </div>
  );
};