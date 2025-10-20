import React, { useMemo } from 'react';
import type { PortalDTO, EventDTO, ZoneDTO } from '../adapters/readOnlyData';

interface BadgeStackOverlayProps {
  portals: PortalDTO[];
  events: EventDTO[];
  zones: ZoneDTO[];
}

// Simple grouping by quantized lat/lng to stack nearby badges together
function keyFor(lat: number, lng: number) {
  return `${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

const BadgeStackOverlay: React.FC<BadgeStackOverlayProps> = ({ portals, events, zones }) => {
  const stacks = useMemo(() => {
    type Badge = { id: string; label: string; lat: number; lng: number; type: 'zone' | 'event' | 'portal' };
    const groups = new Map<string, { lat: number; lng: number; badges: Badge[] }>();

    const push = (b: Badge) => {
      const k = keyFor(b.lat, b.lng);
      const g = groups.get(k) || { lat: b.lat, lng: b.lng, badges: [] };
      g.badges.push(b);
      groups.set(k, g);
    };

    // Zones: use polygon centroid
    zones.forEach((z) => {
      if (!z.polygon || !z.polygon.length) return;
      const center = z.polygon.reduce(
        (acc, [lat, lng]) => ({ lat: acc.lat + lat / z.polygon.length, lng: acc.lng + lng / z.polygon.length }),
        { lat: 0, lng: 0 }
      );
      push({ id: `zone-${z.id}`, label: z.label, lat: center.lat, lng: center.lng, type: 'zone' });
    });

    // Events
    events.forEach((e) => {
      push({ id: `event-${e.id}`, label: e.title, lat: e.lat, lng: e.lng, type: 'event' });
    });

    // Portals
    portals.forEach((p) => {
      push({ id: `portal-${p.id}`, label: p.name, lat: p.lat, lng: p.lng, type: 'portal' });
    });

    // Sort badges in each group Zone -> Event -> Portal
    const priority = { zone: 0, event: 1, portal: 2 } as const;
    const arr = Array.from(groups.entries()).map(([k, g]) => {
      g.badges.sort((a, b) => priority[a.type] - priority[b.type]);
      return { key: k, ...g };
    });

    return arr;
  }, [portals, events, zones]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {stacks.map((s) => {
        const left = `${(((s.lng % 360) + 360) % 360)}%`;
        const top = `${((90 - s.lat) / 180) * 100}%`;
        return (
          <div key={s.key} className="absolute" style={{ left, top, transform: 'translate(-50%, -100%)' }}>
            <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
              {s.badges.map((b) => (
                <div
                  key={b.id}
                  data-badge-id={b.id}
                  className="living-hud-glass px-2 py-1 text-[10px] font-semibold whitespace-nowrap pointer-events-auto select-none"
                  style={{ color: 'var(--living-map-text-primary)', minWidth: 80, textAlign: 'center' }}
                  title={b.label}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeStackOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™