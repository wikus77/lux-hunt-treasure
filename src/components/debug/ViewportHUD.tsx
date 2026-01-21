// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// VIEWPORT DEBUG HUD - Shows real-time viewport metrics for iOS WKWebView debugging
// Enable with ?debug=1 in URL or in DEV mode

import React, { useState, useEffect } from 'react';

interface ViewportMetrics {
  // Window dimensions
  innerHeight: number;
  innerWidth: number;
  // Document dimensions
  clientHeight: number;
  clientWidth: number;
  // Visual Viewport (iOS critical)
  visualViewportHeight: number | null;
  visualViewportWidth: number | null;
  visualViewportOffsetTop: number | null;
  visualViewportScale: number | null;
  // Safe area insets (computed)
  safeAreaTop: string;
  safeAreaBottom: string;
  safeAreaLeft: string;
  safeAreaRight: string;
  // Container heights
  rootHeight: number | null;
  bodyOverflow: string;
  htmlOverflow: string;
  // Capacitor detection
  isCapacitor: boolean;
  capacitorPlatform: string;
  // Computed app height
  appHeight: number;
}

const getComputedSafeArea = (property: string): string => {
  try {
    const div = document.createElement('div');
    div.style.paddingTop = `env(${property}, 0px)`;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).paddingTop;
    document.body.removeChild(div);
    return computed || '0px';
  } catch {
    return '0px';
  }
};

const getMetrics = (): ViewportMetrics => {
  const vv = window.visualViewport;
  const cap = (window as any).Capacitor;
  
  return {
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
    visualViewportHeight: vv?.height ?? null,
    visualViewportWidth: vv?.width ?? null,
    visualViewportOffsetTop: vv?.offsetTop ?? null,
    visualViewportScale: vv?.scale ?? null,
    safeAreaTop: getComputedSafeArea('safe-area-inset-top'),
    safeAreaBottom: getComputedSafeArea('safe-area-inset-bottom'),
    safeAreaLeft: getComputedSafeArea('safe-area-inset-left'),
    safeAreaRight: getComputedSafeArea('safe-area-inset-right'),
    rootHeight: document.getElementById('root')?.clientHeight ?? null,
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    isCapacitor: !!(cap?.isNativePlatform?.() || (window as any).__CAPACITOR_NATIVE__),
    capacitorPlatform: cap?.getPlatform?.() || 'web',
    appHeight: vv?.height ?? window.innerHeight,
  };
};

export const ViewportHUD: React.FC = () => {
  const [metrics, setMetrics] = useState<ViewportMetrics>(getMetrics);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Check if HUD should be visible
  useEffect(() => {
    const url = new URL(window.location.href);
    const debugParam = url.searchParams.get('debug');
    const isDev = import.meta.env.DEV;
    
    // Show if ?debug=1 or in DEV mode with Capacitor
    if (debugParam === '1' || (isDev && (window as any).Capacitor)) {
      setVisible(true);
    }
  }, []);

  // Update metrics on events
  useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => setMetrics(getMetrics());

    // Listen to all relevant events
    window.addEventListener('resize', updateMetrics);
    window.addEventListener('orientationchange', updateMetrics);
    window.visualViewport?.addEventListener('resize', updateMetrics);
    window.visualViewport?.addEventListener('scroll', updateMetrics);

    // Initial update
    updateMetrics();

    // Log to console for debugging
    console.log('📐 [ViewportHUD] Initial metrics:', getMetrics());

    return () => {
      window.removeEventListener('resize', updateMetrics);
      window.removeEventListener('orientationchange', updateMetrics);
      window.visualViewport?.removeEventListener('resize', updateMetrics);
      window.visualViewport?.removeEventListener('scroll', updateMetrics);
    };
  }, [visible]);

  if (!visible) return null;

  // Detect viewport mismatch (the iOS bug)
  const hasViewportMismatch = metrics.visualViewportHeight !== null && 
    Math.abs(metrics.innerHeight - metrics.visualViewportHeight) > 5;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          right: '8px',
          zIndex: 99999,
          background: hasViewportMismatch ? '#ff4444' : '#00d1ff',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '4px 8px',
          fontSize: '10px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        📐 HUD {hasViewportMismatch && '⚠️'}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        right: '8px',
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#00d1ff',
        padding: '8px',
        borderRadius: '8px',
        fontSize: '9px',
        fontFamily: 'monospace',
        maxWidth: '180px',
        border: hasViewportMismatch ? '2px solid #ff4444' : '1px solid #00d1ff',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <strong>📐 VIEWPORT HUD</strong>
        <button
          onClick={() => setMinimized(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          −
        </button>
      </div>

      {hasViewportMismatch && (
        <div style={{ background: '#ff4444', color: '#fff', padding: '2px 4px', marginBottom: '4px', borderRadius: '4px' }}>
          ⚠️ 100vh BUG DETECTED
        </div>
      )}

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ color: '#888' }}>Platform</div>
        <div>{metrics.isCapacitor ? `📱 ${metrics.capacitorPlatform.toUpperCase()}` : '🌐 WEB'}</div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ color: '#888' }}>Window</div>
        <div>innerH: <span style={{ color: '#fff' }}>{metrics.innerHeight}</span></div>
        <div>innerW: <span style={{ color: '#fff' }}>{metrics.innerWidth}</span></div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ color: '#888' }}>Visual Viewport</div>
        <div style={{ color: hasViewportMismatch ? '#ff4444' : '#0f0' }}>
          height: <span style={{ fontWeight: 'bold' }}>{metrics.visualViewportHeight ?? 'N/A'}</span>
        </div>
        <div>offsetTop: {metrics.visualViewportOffsetTop ?? 'N/A'}</div>
        <div>scale: {metrics.visualViewportScale?.toFixed(2) ?? 'N/A'}</div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ color: '#888' }}>Safe Area</div>
        <div>top: <span style={{ color: '#0f0' }}>{metrics.safeAreaTop}</span></div>
        <div>bottom: <span style={{ color: '#0f0' }}>{metrics.safeAreaBottom}</span></div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ color: '#888' }}>Containers</div>
        <div>#root: {metrics.rootHeight}px</div>
        <div>body.overflow: {metrics.bodyOverflow}</div>
      </div>

      <div>
        <div style={{ color: '#888' }}>Recommended --app-height</div>
        <div style={{ color: '#0f0', fontWeight: 'bold' }}>{metrics.appHeight}px</div>
      </div>

      <div style={{ marginTop: '4px', fontSize: '8px', color: '#666' }}>
        Delta: {metrics.visualViewportHeight ? metrics.innerHeight - metrics.visualViewportHeight : 0}px
      </div>
    </div>
  );
};

// Export the metrics updater for use in other components
export const updateAppHeight = () => {
  const vv = window.visualViewport;
  const height = vv?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
  return height;
};

// Global API for debugging
if (typeof window !== 'undefined') {
  (window as any).__VIEWPORT_DEBUG = () => {
    const m = getMetrics();
    console.table(m);
    return m;
  };
}

export default ViewportHUD;

