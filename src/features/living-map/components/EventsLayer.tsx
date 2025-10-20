import React from 'react';
import PulseMarker from './PulseMarker';
import type { EventDTO } from '../adapters/readOnlyData';

interface EventsLayerProps {
  events: EventDTO[];
  showLabels?: boolean;
}

const EVENT_COLORS = {
  success: '#24E39E',
  warning: '#FFB347',
  rare: '#00E5FF'
};

const EventsLayer: React.FC<EventsLayerProps> = ({ events, showLabels = true }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {events.map((event) => (
        <div
          key={event.id}
          className="absolute"
          style={{
            left: `${(event.lng % 360 + 360) % 360}%`,
            top: `${(90 - event.lat) / 180 * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <PulseMarker
            color={EVENT_COLORS[event.type]}
            size={28}
            duration={2}
          />
          
          {showLabels && (
            <div
              className="living-hud-glass mt-2 px-2 py-1 text-xs whitespace-nowrap pointer-events-auto cursor-pointer"
              style={{
                color: 'var(--living-map-text-primary)',
                fontSize: '10px',
                fontWeight: 600,
                borderColor: EVENT_COLORS[event.type],
                borderWidth: '1px'
              }}
              title={event.title}
            >
              {event.title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventsLayer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
