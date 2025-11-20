// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
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
    <div 
      className="p-4 sm:p-6 mb-6 relative overflow-hidden rounded-[24px]"
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white">Le tue notifiche</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onManualReload} className="flex-1 sm:flex-none">
            <Bell className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="flex-1 sm:flex-none">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Segna tutto come letto
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 overflow-x-auto mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="flex-shrink-0 flex-1 sm:flex-none"
        >
          <Bell className="w-4 h-4 mr-2" />
          Generali
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('unread')}
          className="flex-shrink-0 flex-1 sm:flex-none"
        >
          <Bell className="w-4 h-4 mr-2" />
          Buzz
        </Button>
        <Button
          variant={filter === 'important' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('important')}
          className="flex-shrink-0 flex-1 sm:flex-none"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Classifica
        </Button>
      </div>
    </div>
  );
};