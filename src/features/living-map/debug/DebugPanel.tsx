import React, { useEffect, useState } from 'react';

export default function DebugPanel() {
  if (import.meta.env.VITE_LIVING_MAP_DEBUG !== 'true') return null;

  const [state, setState] = useState<any>({});

  useEffect(() => {
    const data = {
      env: {
        VITE_ENABLE_LIVING_MAP: String(import.meta.env.VITE_ENABLE_LIVING_MAP),
        VITE_MAP_ENGINE: String(import.meta.env.VITE_MAP_ENGINE || '—'),
        VITE_MAPLIBRE_STYLE: String(import.meta.env.VITE_MAPLIBRE_STYLE || '—'),
        VITE_TERRAIN_SOURCE: String(import.meta.env.VITE_TERRAIN_SOURCE || '—'),
        VITE_TERRAIN_URL: String(import.meta.env.VITE_TERRAIN_URL || '—'),
        VITE_LIVING_MAP_DEBUG: String(import.meta.env.VITE_LIVING_MAP_DEBUG),
      },
      dom: {
        leafletContainer: !!document.querySelector('.leaflet-container'),
        maplibreCanvas: !!document.querySelector('.maplibregl-canvas'),
        dock: !!document.querySelector('#m1-dock'),
        legend: !!document.querySelector('[data-m1=legend-hud]'),
        controls3D: !!document.querySelector('[data-m1=controls-3d]'),
      },
      gl: {
        hasLmaplibre: typeof (window as any).L?.maplibreGL === 'function',
        hasMaplibregl: typeof (window as any).maplibregl !== 'undefined',
      },
      panes: (() => {
        const panes: any = {};
        document.querySelectorAll('.leaflet-pane').forEach((el: any) => {
          const id = el.className.split(' ').find((c: string) => c.endsWith('-pane')) || 'pane';
          panes[id] = (el as HTMLElement).style.zIndex || '—';
        });
        return panes;
      })(),
      ts: new Date().toISOString(),
    };

    console.group('%cM1SSION • LIVING MAP — DEBUG', 'color:#00E5FF');
    console.table(data.env);
    console.table(data.dom);
    console.table(data.gl);
    console.log('panes:', data.panes);
    console.groupEnd();

    setState(data);
  }, []);

  const style: React.CSSProperties = {
    position: 'fixed', right: 12, bottom: 84, zIndex: 20000,
    width: 360, maxHeight: 280, overflow: 'auto',
    background: 'rgba(6,10,16,.88)', border: '1px solid rgba(0,229,255,.35)',
    boxShadow: '0 0 22px rgba(0,229,255,.25)', borderRadius: 12,
    color: '#CDE8F3', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12,
    pointerEvents: 'auto'
  };

  return (
    <div style={style} data-m1="debug-panel">
      <div style={{padding:'10px 12px', fontWeight:700, color:'#8BE9FF'}}>
        LIVING MAP™ • DEBUG
      </div>
      <div style={{padding:'0 12px 12px', display:'grid', gap:6}}>
        <Row k="Enable Flag" v={String(state?.env?.VITE_ENABLE_LIVING_MAP)} />
        <Row k="L.maplibreGL" v={String(state?.gl?.hasLmaplibre)} />
        <Row k="maplibregl (window)" v={String(state?.gl?.hasMaplibregl)} />
        <Row k="Leaflet DOM" v={String(state?.dom?.leafletContainer)} />
        <Row k="MapLibre Canvas" v={String(state?.dom?.maplibreCanvas)} />
        <Row k="Dock" v={String(state?.dom?.dock)} />
        <Row k="Legend HUD" v={String(state?.dom?.legend)} />
        <Row k="3D Controls" v={String(state?.dom?.controls3D)} />
        <div style={{opacity:.8, marginTop:6}}>panes zIndex: <code>{JSON.stringify(state?.panes)}</code></div>
        <div style={{opacity:.5}}>ts: {state?.ts}</div>
      </div>
    </div>
  );
}

function Row({k, v}:{k:string; v:string}) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', gap:10}}>
      <div style={{opacity:.7}}>{k}</div><div>{v}</div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
