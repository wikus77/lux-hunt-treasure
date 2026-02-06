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
  // 🔧 FIX 06/02/2026: Added m1-neon-border-animated (same as M1SSION PRIZE)
  return (
    <div className="sn-card-elevated m1-neon-border-animated p-4 sm:p-6 mb-6" style={{ position: 'relative', isolation: 'isolate' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="sn-section-title" style={{ marginBottom: 0 }}>Le tue notifiche</h2>
        {/* 🎨 FIX 06/02/2026: Buttons in pill style (same as Generali/Buzz/Classifica tabs) */}
        <div className="sn-tabs-container" style={{ flex: 'none', width: 'auto' }}>
          <button onClick={onManualReload} className="sn-tab flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Aggiorna</span>
          </button>
          <button onClick={onMarkAllAsRead} className="sn-tab flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Segna tutto</span>
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