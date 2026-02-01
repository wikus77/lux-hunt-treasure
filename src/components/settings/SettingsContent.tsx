// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Settings Content - REVOLUT STYLE (identico design a AgentProfileContent)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  X, User, Shield, Target, Bell, Lock, 
  FileText, Info, MapPin, Stethoscope, 
  ChevronRight, Settings, CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getProjectRef } from '@/lib/supabase/clientUtils';

interface SettingsContentProps {
  onClose: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ onClose }) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('Verifica...');
  
  const supabaseProjectId = getProjectRef();

  useEffect(() => {
    checkGeolocation();
    checkSession();
  }, []);

  const checkGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGeolocationEnabled(true),
        () => setGeolocationEnabled(false)
      );
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionStatus(session ? 'Attiva' : 'Non attiva');
    } catch (error) {
      setSessionStatus('Errore');
    }
  };

  const goTo = (path: string) => {
    onClose();
    setTimeout(() => setLocation(path), 50);
  };

  const sections = [
    {
      id: 'agent-profile',
      label: 'Profilo Agente',
      description: 'Avatar, nome e informazioni agente',
      icon: User,
      color: '#00D1FF',
      path: '/settings/agent-profile',
    },
    {
      id: 'security',
      label: 'Sicurezza',
      description: 'Password e codici di emergenza',
      icon: Shield,
      color: '#22C55E',
      path: '/settings/security',
    },
    {
      id: 'mission',
      label: 'Missione',
      description: 'Stato missioni e progressi',
      icon: Target,
      color: '#F59E0B',
      path: '/settings/mission',
    },
    {
      id: 'notifications',
      label: 'Notifiche',
      description: 'Preferenze e alert',
      icon: Bell,
      color: '#EF4444',
      path: '/settings/notifications',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Gestione consensi e cookie',
      icon: Lock,
      color: '#A855F7',
      path: '/settings/privacy',
    },
    {
      id: 'payment-methods',
      label: 'Metodi di Pagamento',
      description: 'Carte, Apple Pay, Google Pay',
      icon: CreditCard,
      color: '#14B8A6',
      path: '/settings/payment-methods',
    },
    {
      id: 'legal',
      label: 'Legale',
      description: 'Termini, privacy e account',
      icon: FileText,
      color: '#EC4899',
      path: '/settings/legal',
    },
    {
      id: 'app-info',
      label: 'Info App',
      description: 'Versione, supporto e credits',
      icon: Info,
      color: '#6366F1',
      path: '/settings/app-info',
    },
  ];

  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // REVOLUT: TRASPARENTE - il blur viene dal backdrop overlay
        background: 'transparent',
      }}
    >
      {/* HEADER - REVOLUT STYLE: semi-trasparente glass */}
      <div 
        style={{
          flexShrink: 0,
          // Gradiente cyan/blu come tema Settings
          background: 'linear-gradient(180deg, rgba(0, 80, 120, 0.8) 0%, rgba(0, 50, 80, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          {/* X button */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>

          {/* Title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ 
              color: '#FFFFFF', 
              fontSize: '18px', 
              fontWeight: 700,
              letterSpacing: '1px',
            }}>
              IMPOSTAZIONI
            </h1>
          </div>

          {/* Spacer */}
          <div style={{ width: '40px' }} />
        </div>

        {/* Subtitle */}
        <p style={{ 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '13px', 
          textAlign: 'center',
        }}>
          Configura la tua esperienza M1SSION
        </p>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Settings Sections */}
        <GlassCard style={{ marginBottom: '16px', padding: 0 }}>
          {sections.map((section, index) => (
            <SettingsMenuItem
              key={section.id}
              icon={section.icon}
              label={section.label}
              description={section.description}
              color={section.color}
              onClick={() => goTo(section.path)}
              last={index === sections.length - 1}
            />
          ))}
        </GlassCard>

        {/* Privacy & Permissions */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Privacy & Permessi</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Geolocalizzazione</span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              background: geolocationEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
              color: geolocationEnabled ? '#22c55e' : 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {geolocationEnabled ? 'Attiva' : 'Disattiva'}
            </span>
          </div>
          
          <button
            onClick={checkGeolocation}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: 'rgba(96, 165, 250, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              color: '#60a5fa',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Verifica Permessi
          </button>
        </GlassCard>

        {/* Diagnostics */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Stethoscope style={{ width: '18px', height: '18px', color: '#22c55e' }} />
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Diagnostica</span>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Supabase ID</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                {supabaseProjectId.slice(0, 8)}...
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Stato Sessione</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                background: sessionStatus === 'Attiva' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: sessionStatus === 'Attiva' ? '#22c55e' : '#ef4444',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {sessionStatus}
              </span>
            </div>
          </div>
          
          <button
            onClick={checkSession}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Verifica Sessione
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

// GLASS CARD - REVOLUT STYLE: vetro fumé semi-trasparente
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      // REVOLUT: vetro fumé scuro semi-trasparente
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      // Bordo sottile visibile
      border: '1px solid rgba(255, 255, 255, 0.08)',
      // Ombra morbida
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

// SETTINGS MENU ITEM
const SettingsMenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
  last?: boolean;
}> = ({ icon: Icon, label, description, color, onClick, last }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'transparent',
      border: 'none',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div 
        style={{
          padding: '10px',
          borderRadius: '12px',
          background: `${color}20`,
          boxShadow: `0 0 10px ${color}30`,
        }}
      >
        <Icon style={{ width: '20px', height: '20px', color: color }} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{label}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{description}</p>
      </div>
    </div>
    <ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.3)' }} />
  </button>
);

export default SettingsContent;
