// © 2025 Joseph MULÉ – M1SSION™ – Supabase Runtime Diagnostics

import React from 'react';
import { getSupabaseDiag } from '@/lib/supabase/diag';
import { supabase } from '@/integrations/supabase/client';

export default function DiagSupabase() {
  const [rpcHealth, setRpcHealth] = React.useState<any>(null);
  const [rpcError, setRpcError] = React.useState<string | null>(null);

  // Fire a safe query to verify client is alive
  React.useEffect(() => {
    void supabase.auth.getSession();
  }, []);

  // Fetch health metrics via RPC
  React.useEffect(() => {
    (async () => {
      try {
        // Use type assertion since RPC types aren't auto-generated yet
        const { data, error } = await supabase.rpc('supabase_client_health' as any);
        if (error) {
          setRpcError(error.message);
          console.warn('[SUPABASE-DIAG] RPC error:', error);
        } else {
          setRpcHealth(data);
        }
      } catch (err: any) {
        setRpcError(err?.message || String(err));
        console.warn('[SUPABASE-DIAG] RPC exception:', err);
      }
    })();
  }, []);

  const diag = getSupabaseDiag();

  return (
    <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui', maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        🔍 Supabase Runtime Diagnostics
      </h1>

      {/* Instance Count */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Client Instances
        </h2>
        <p>
          <strong>Count:</strong>{' '}
          <span style={{ 
            color: diag.count === 1 ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
            fontSize: 20
          }}>
            {diag.count}
          </span>
        </p>
        <p style={{ marginTop: 4, color: '#6b7280' }}>
          <strong>Expected:</strong> count === 1 (singleton pattern)
        </p>
        {diag.count > 1 && (
          <div style={{ 
            marginTop: 12, 
            padding: 12, 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: 4
          }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                ⚠️ Last re-initialization stack trace
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: 12, 
                marginTop: 8,
                overflow: 'auto'
              }}>
                {diag.lastInitStack}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Environment
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>Mode:</strong> {diag.env.mode}</li>
          <li><strong>Dev:</strong> {String(diag.env.dev)}</li>
          <li><strong>Prod:</strong> {String(diag.env.prod)}</li>
        </ul>
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      {/* Health RPC */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Supabase Health (RPC)
        </h2>
        {rpcError ? (
          <div style={{ 
            padding: 12, 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: 4,
            color: '#991b1b'
          }}>
            <strong>Error:</strong> {rpcError}
          </div>
        ) : rpcHealth ? (
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            backgroundColor: '#f3f4f6',
            padding: 12,
            borderRadius: 4,
            fontSize: 13,
            overflow: 'auto'
          }}>
            {JSON.stringify(rpcHealth, null, 2)}
          </pre>
        ) : (
          <p style={{ color: '#6b7280' }}>Loading health metrics...</p>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
        <p style={{ fontSize: 14, color: '#166534' }}>
          ℹ️ This page verifies that the Supabase client is a proper singleton.
          Navigate through the app and return here — the count should remain <strong>1</strong>.
        </p>
      </div>
    </div>
  );
}
