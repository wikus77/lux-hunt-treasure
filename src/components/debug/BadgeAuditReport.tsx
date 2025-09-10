/**
 * © 2025 Joseph MULÉ – M1SSION™ – Badge Audit Report Component
 * PHASE 1 AUDIT: Display environment detection and flow tracing
 */

import React from 'react';
import { getBadgeDiagnostics } from '@/utils/pwaBadgeAudit';
import { useNotifications } from '@/hooks/useNotifications';

export const BadgeAuditReport: React.FC = () => {
  const { unreadCount } = useNotifications();
  const diagnostics = getBadgeDiagnostics();
  
  if (import.meta.env.VITE_BADGE_DEBUG !== '1') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 PWA BADGE AUDIT</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Environment:</strong>
          <div className="ml-2">
            <div>Standalone: {diagnostics.standalone ? '✅' : '❌'}</div>
            <div>setAppBadge: {diagnostics.hasSetAppBadge ? '✅' : '❌'}</div>
            <div>clearAppBadge: {diagnostics.hasClearAppBadge ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div>
          <strong>Current State:</strong>
          <div className="ml-2">
            <div>Unread Count: {unreadCount}</div>
            <div>Notice Badge: {unreadCount > 0 ? '🔴 Visible' : '⚪ Hidden'}</div>
          </div>
        </div>
        
        {diagnostics.lastTest && (
          <div>
            <strong>Last Test:</strong>
            <div className="ml-2">
              <div>Count: {diagnostics.lastTest.count}</div>
              <div>Success: {diagnostics.lastTest.success ? '✅' : '❌'}</div>
              {diagnostics.lastTest.error && (
                <div className="text-red-400">Error: {diagnostics.lastTest.error}</div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-2">
          UA: {diagnostics.ua.slice(0, 30)}...
        </div>
      </div>
    </div>
  );
};