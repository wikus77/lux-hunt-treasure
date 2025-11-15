/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * BUZZ Debug Panel - Read-Only Diagnostics
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzGrants } from '@/hooks/useBuzzGrants';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { supabase } from '@/integrations/supabase/client';
import { CopyJsonButton } from './CopyJsonButton';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const DebugBuzzPanel: React.FC = () => {
  const { user, session, isAuthenticated } = useUnifiedAuth();
  const { hasFreeBuzz, totalRemaining } = useBuzzGrants();
  const { getCurrentBuzzCostM1U } = useBuzzCounter(user?.id);
  const [collapsed, setCollapsed] = useState(true);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  // Get JWT info safely
  const getJwtInfo = () => {
    if (!session?.access_token) return { len: 0, exp: null };
    try {
      const parts = session.access_token.split('.');
      if (parts.length !== 3) return { len: 0, exp: null };
      const payload = JSON.parse(atob(parts[1]));
      return {
        len: session.access_token.length,
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
      };
    } catch (e) {
      return { len: session.access_token.length, exp: null };
    }
  };

  const runDiagnostics = async () => {
    try {
      console.log('M1DEBUG: Running BUZZ diagnostics...');
      
      // Test get-user-state with debug header
      const { data, error } = await supabase.functions.invoke('get-user-state', {
        body: { userId: user?.id },
        headers: { 'x-m1-debug': '1' }
      });

      const jwtInfo = getJwtInfo();
      const origin = window.location.origin;

      const diag = {
        timestamp: new Date().toISOString(),
        auth: {
          isAuthenticated,
          userId: user?.id?.substring(0, 8) + '...',
          jwtLen: jwtInfo.len,
          jwtExp: jwtInfo.exp
        },
        economy: {
          hasFreeBuzz,
          totalRemaining,
          currentCostM1U: getCurrentBuzzCostM1U()
        },
        network: {
          origin,
          endpoint: 'handle-buzz-press'
        },
        corsCheck: {
          success: !error,
          debugInfo: data?.__debug || null,
          error: error?.message || null
        }
      };

      setDiagnostics(diag);
      console.log('M1DEBUG: BUZZ diagnostics:', diag);
    } catch (e: any) {
      console.error('M1DEBUG: Diagnostics failed:', e);
      setDiagnostics({ error: e.message });
    }
  };

  const testBuzzDry = async () => {
    try {
      console.log('M1DEBUG: Testing BUZZ (dry run)...');
      
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          hasFreeBuzz,
          currentPrice: getCurrentBuzzCostM1U(),
          dryRun: true
        },
        headers: { 'x-m1-debug': '1' }
      });

      const result = {
        timestamp: new Date().toISOString(),
        success: !error,
        data,
        error: error?.message || null
      };

      setLastResult(result);
      console.log('M1DEBUG: BUZZ test result:', result);
    } catch (e: any) {
      console.error('M1DEBUG: BUZZ test failed:', e);
      setLastResult({ error: e.message });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      runDiagnostics();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return null;

  const panel = (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        padding: collapsed ? '8px' : '12px',
        borderRadius: '8px',
        fontSize: '11px',
        zIndex: 2147483000,
        maxWidth: '320px',
        maxHeight: collapsed ? '40px' : '60vh',
        overflow: 'auto',
        fontFamily: 'monospace',
        border: '1px solid #3b82f6'
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginBottom: collapsed ? 0 : '8px'
        }}
      >
        <span>🧪 BUZZ DEBUG</span>
        {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {!collapsed && (
        <>
          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Auth & Session</div>
            <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
            <div>User ID: {user?.id?.substring(0, 12)}...</div>
            <div>JWT Len: {getJwtInfo().len}</div>
            <div>JWT Exp: {getJwtInfo().exp?.substring(11, 19) || 'N/A'}</div>
          </div>

          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Economy</div>
            <div>Free BUZZ: {hasFreeBuzz ? '✅' : '❌'}</div>
            <div>Remaining: {totalRemaining}</div>
            <div>Cost M1U: {getCurrentBuzzCostM1U()}</div>
          </div>

          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Network</div>
            <div>Origin: {window.location.origin.substring(0, 30)}...</div>
            <div>Endpoint: handle-buzz-press</div>
          </div>

          {diagnostics && (
            <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CORS Check</div>
              <div>Status: {diagnostics.corsCheck?.success ? '✅' : '❌'}</div>
              {diagnostics.corsCheck?.debugInfo && (
                <>
                  <div>Saw Auth: {diagnostics.corsCheck.debugInfo.sawAuthorizationHeader ? '✅' : '❌'}</div>
                  <div>JWT Len: {diagnostics.corsCheck.debugInfo.jwtLen}</div>
                  <div>Allowed Origin: {diagnostics.corsCheck.debugInfo.allowedOrigin?.substring(0, 25) || 'N/A'}</div>
                </>
              )}
              <CopyJsonButton data={diagnostics} label="Copy Full" />
            </div>
          )}

          {lastResult && (
            <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Last Test</div>
              <div>Success: {lastResult.success ? '✅' : '❌'}</div>
              {lastResult.data?.clue_text && <div>Clue: {lastResult.data.clue_text.substring(0, 30)}...</div>}
              {lastResult.error && <div style={{ color: '#ef4444' }}>Error: {lastResult.error}</div>}
              <CopyJsonButton data={lastResult} label="Copy Result" />
            </div>
          )}

          <div style={{ display: 'flex', gap: '4px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <button
              onClick={runDiagnostics}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
            <button
              onClick={testBuzzDry}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test BUZZ
            </button>
          </div>
        </>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
