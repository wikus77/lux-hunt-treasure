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
  // 🎨 SOFT NATIVE: Clean header card
  return (
    <div className="sn-card-elevated p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="sn-section-title" style={{ marginBottom: 0 }}>Le tue notifiche</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={onManualReload} className="sn-icon-btn flex items-center gap-2 px-3 w-auto">
            <Bell className="w-4 h-4" style={{ color: 'var(--sn-text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--sn-text-secondary)' }}>Aggiorna</span>
          </button>
          <button onClick={onMarkAllAsRead} className="sn-icon-btn flex items-center gap-2 px-3 w-auto">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sn-text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--sn-text-secondary)' }}>Segna tutto come letto</span>
          </button>
        </div>
      </div>
      
      {/* 🎨 SOFT NATIVE: Pill-style filter tabs */}
      <div className="sn-tabs-container">
        <button
          onClick={() => onFilterChange('all')}
          className={`sn-tab ${filter === 'all' ? 'sn-tab-active' : ''}`}
        >
          <Bell className="w-4 h-4 mr-2 inline" />
          Generali
        </button>
        <button
          onClick={() => onFilterChange('unread')}
          className={`sn-tab ${filter === 'unread' ? 'sn-tab-active' : ''}`}
        >
          <Bell className="w-4 h-4 mr-2 inline" />
          Buzz
        </button>
        <button
          onClick={() => onFilterChange('important')}
          className={`sn-tab ${filter === 'important' ? 'sn-tab-active' : ''}`}
        >
          <AlertCircle className="w-4 h-4 mr-2 inline" />
          Classifica
        </button>
      </div>
    </div>
  );
};