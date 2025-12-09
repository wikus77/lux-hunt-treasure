// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ v4 - Shadow Intercepts Panel
// v4: Threat Level display, entity stats, last SHADOW contact

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useEntityOverlayStore, 
  selectRecentEvents,
  selectShadowThreatLevel,
  selectEntityEventCounts,
} from '@/stores/entityOverlayStore';
import { 
  getThreatLevelCategory,
  type ShadowEntity,
  type ThreatLevelCategory,
} from '@/config/shadowProtocolConfig';

// ============================================================================
// THREAT LEVEL DISPLAY COMPONENT
// ============================================================================

interface ThreatLevelDisplayProps {
  level: number;
  category: ThreatLevelCategory;
}

const ThreatLevelDisplay: React.FC<ThreatLevelDisplayProps> = ({ level, category }) => {
  // Colori per categoria
  const categoryColors: Record<ThreatLevelCategory, { bg: string; border: string; text: string; glow: string }> = {
    LOW: { 
      bg: 'rgba(0, 229, 255, 0.1)', 
      border: '#00e5ff', 
      text: '#00e5ff',
      glow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    MEDIUM: { 
      bg: 'rgba(255, 170, 0, 0.1)', 
      border: '#ffaa00', 
      text: '#ffaa00',
      glow: '0 0 10px rgba(255, 170, 0, 0.3)',
    },
    HIGH: { 
      bg: 'rgba(255, 0, 85, 0.1)', 
      border: '#ff0055', 
      text: '#ff0055',
      glow: '0 0 15px rgba(255, 0, 85, 0.4)',
    },
  };

  const colors = categoryColors[category];
  const roundedLevel = Math.round(level);

  // Barra di progresso per threat level (0-5)
  const progressPercent = (level / 5) * 100;

  return (
    <div 
      className="shadow-threat-level"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        boxShadow: colors.glow,
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ 
          color: '#888', 
          fontSize: '10px', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          THREAT LEVEL
        </span>
        <span style={{ 
          color: colors.text, 
          fontSize: '12px', 
          fontWeight: 'bold',
          padding: '2px 8px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '4px',
        }}>
          {category}
        </span>
      </div>

      {/* Level Number */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline',
        gap: '4px',
        marginBottom: '8px',
      }}>
        <span style={{ 
          color: colors.text, 
          fontSize: '32px', 
          fontWeight: 'bold',
          fontFamily: 'var(--font-orbitron, monospace)',
          lineHeight: 1,
        }}>
          {roundedLevel}
        </span>
        <span style={{ 
          color: '#666', 
          fontSize: '14px',
        }}>
          / 5
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <motion.div 
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${colors.border}, ${colors.text})`,
            borderRadius: '2px',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Level Pills */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '8px',
        gap: '4px',
      }}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              width: '100%',
              height: '3px',
              borderRadius: '2px',
              background: n <= roundedLevel ? colors.border : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ENTITY STATS COMPONENT
// ============================================================================

interface EntityStatsProps {
  counts: { MCP: number; SHADOW: number; ECHO: number };
  lastShadowContact: number | null;
}

const EntityStats: React.FC<EntityStatsProps> = ({ counts, lastShadowContact }) => {
  const entityColors: Record<ShadowEntity, string> = {
    MCP: '#00e5ff',
    SHADOW: '#ff0055',
    ECHO: '#a0a0a0',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: '12px',
    }}>
      {/* Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        {(['MCP', 'SHADOW', 'ECHO'] as ShadowEntity[]).map((entity) => (
          <div
            key={entity}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              background: `${entityColors[entity]}10`,
              borderRadius: '4px',
              border: `1px solid ${entityColors[entity]}30`,
            }}
          >
            <span style={{ 
              color: entityColors[entity], 
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              {entity}
            </span>
            <span style={{ 
              color: entityColors[entity], 
              fontSize: '12px',
              fontFamily: 'monospace',
            }}>
              {counts[entity]}
            </span>
          </div>
        ))}
      </div>

      {/* Last SHADOW Contact */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
      }}>
        <span style={{ color: '#666' }}>Last SHADOW contact:</span>
        <span style={{ 
          color: lastShadowContact ? '#ff0055' : '#444',
          fontFamily: 'monospace',
        }}>
          {lastShadowContact 
            ? formatTimestamp(lastShadowContact)
            : 'No direct contact yet'
          }
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ShadowIntercepts - Pannello che mostra i messaggi Shadow Protocol recenti
 * v4: Include threat level, statistiche entità, ultimo contatto SHADOW
 */
export const ShadowIntercepts: React.FC = () => {
  const recentEvents = useEntityOverlayStore(selectRecentEvents);
  const threatLevel = useEntityOverlayStore(selectShadowThreatLevel);
  const entityCounts = useEntityOverlayStore(selectEntityEventCounts);

  // Calcola categoria threat
  const threatCategory = useMemo(() => getThreatLevelCategory(threatLevel), [threatLevel]);

  // Trova ultimo contatto SHADOW
  const lastShadowContact = useMemo(() => {
    const shadowEvent = recentEvents.find((e) => e.entity === 'SHADOW');
    return shadowEvent?.timestamp || null;
  }, [recentEvents]);

  // Se nessun evento, mostra stato iniziale con threat level
  if (recentEvents.length === 0) {
    return (
      <div className="shadow-intercepts-container empty">
        <div className="shadow-intercepts-header">
          <span className="shadow-intercepts-icon">📡</span>
          <span className="shadow-intercepts-title">SHADOW INTERCEPTS</span>
        </div>
        
        {/* 🆕 v4: Mostra threat level anche se vuoto */}
        <ThreatLevelDisplay level={threatLevel} category={threatCategory} />
        
        <div className="shadow-intercepts-empty">
          <p>No intercepts detected.</p>
          <p className="shadow-intercepts-hint">Network activity will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-intercepts-container">
      <div className="shadow-intercepts-header">
        <span className="shadow-intercepts-icon">📡</span>
        <span className="shadow-intercepts-title">SHADOW INTERCEPTS</span>
        <span className="shadow-intercepts-count">{recentEvents.length}</span>
      </div>
      
      {/* 🆕 v4: Threat Level Display */}
      <ThreatLevelDisplay level={threatLevel} category={threatCategory} />
      
      {/* 🆕 v4: Entity Stats */}
      <EntityStats counts={entityCounts} lastShadowContact={lastShadowContact} />
      
      {/* Event List */}
      <div className="shadow-intercepts-list">
        <AnimatePresence mode="popLayout">
          {recentEvents.map((event, index) => (
            <motion.div
              key={`${event.id}-${event.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`shadow-intercept-item entity-${event.entity.toLowerCase()}`}
            >
              <div className="shadow-intercept-entity">
                <EntityBadge entity={event.entity} />
              </div>
              <div className="shadow-intercept-content">
                <p className="shadow-intercept-text">{event.text}</p>
                <span className="shadow-intercept-time">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * EntityBadge - Badge colorato per entità
 */
const EntityBadge: React.FC<{ entity: ShadowEntity }> = ({ entity }) => {
  const colors: Record<ShadowEntity, string> = {
    MCP: '#00e5ff',
    SHADOW: '#ff0055',
    ECHO: '#a0a0a0',
  };

  return (
    <span
      className="shadow-intercept-badge"
      style={{
        color: colors[entity],
        borderColor: colors[entity],
      }}
    >
      {entity}
    </span>
  );
};

/**
 * Format timestamp to HH:MM
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format timestamp to relative time or absolute
 */
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  
  return new Date(timestamp).toLocaleDateString('it-IT', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default ShadowIntercepts;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
