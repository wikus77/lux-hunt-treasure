/**
 * SettingsModal - Modal popup per le impostazioni
 * Si apre premendo la rotella nell'header
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { GlassModal } from '@/components/ui/GlassModal';
import { 
  User, Shield, Target, Bell, Lock, 
  FileText, Info, MapPin, Stethoscope, 
  ChevronRight, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getProjectRef } from '@/lib/supabase/clientUtils';
import { motion } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('Verifica...');
  
  const supabaseProjectId = getProjectRef();

  useEffect(() => {
    if (isOpen) {
      checkGeolocation();
      checkSession();
    }
  }, [isOpen]);

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

  const handleSectionClick = (sectionId: string) => {
    onClose();
    setTimeout(() => {
      setLocation(`/settings/${sectionId}`);
    }, 300);
  };

  const sections = [
    {
      id: 'agent-profile',
      label: 'Profilo Agente',
      description: 'Avatar, nome e informazioni agente',
      icon: User,
      color: '#00D1FF',
    },
    {
      id: 'security',
      label: 'Sicurezza',
      description: 'Password e codici di emergenza',
      icon: Shield,
      color: '#22C55E',
    },
    {
      id: 'mission',
      label: 'Missione',
      description: 'Stato missioni e progressi',
      icon: Target,
      color: '#F59E0B',
    },
    {
      id: 'notifications',
      label: 'Notifiche',
      description: 'Preferenze e alert',
      icon: Bell,
      color: '#EF4444',
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Gestione consensi e cookie',
      icon: Lock,
      color: '#A855F7',
    },
    {
      id: 'legal',
      label: 'Legale',
      description: 'Termini, privacy e account',
      icon: FileText,
      color: '#EC4899',
    },
    {
      id: 'app-info',
      label: 'Info App',
      description: 'Versione, supporto e credits',
      icon: Info,
      color: '#6366F1',
    },
  ];

  return (
    <GlassModal 
      isOpen={isOpen} 
      onClose={onClose} 
      accentColor="#00D1FF"
      title="IMPOSTAZIONI"
      subtitle="Configura la tua esperienza M1SSION"
    >
      {/* Settings Sections */}
      <div className="space-y-2 mb-5">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className="rounded-xl p-3 cursor-pointer transition-all border border-white/10 active:scale-[0.98]"
            style={{ 
              background: 'rgba(255, 255, 255, 0.04)',
            }}
            onClick={() => handleSectionClick(section.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: `${section.color}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-xl"
                  style={{ 
                    background: `${section.color}20`,
                    boxShadow: `0 0 10px ${section.color}30`,
                  }}
                >
                  <section.icon 
                    className="w-5 h-5" 
                    style={{ color: section.color }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{section.label}</h3>
                  <p className="text-xs text-white/50">{section.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Privacy & Permissions */}
      <div 
        className="rounded-xl p-4 mb-4 border border-blue-500/20"
        style={{ background: 'rgba(0, 209, 255, 0.05)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Privacy & Permessi</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/60">Geolocalizzazione</span>
          <Badge 
            variant={geolocationEnabled ? "default" : "secondary"}
            className={geolocationEnabled 
              ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" 
              : "text-xs"
            }
          >
            {geolocationEnabled ? "Attiva" : "Disattiva"}
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkGeolocation}
          className="w-full bg-transparent border-blue-500/30 hover:bg-blue-500/10 text-blue-400 text-xs h-8"
        >
          Verifica Permessi
        </Button>
      </div>

      {/* Diagnostics */}
      <div 
        className="rounded-xl p-4 border border-green-500/20"
        style={{ background: 'rgba(34, 197, 94, 0.05)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Diagnostica</span>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Supabase ID</span>
            <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
              {supabaseProjectId.slice(0, 8)}...
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Stato Sessione</span>
            <Badge 
              variant={sessionStatus === 'Attiva' ? "default" : "destructive"}
              className={sessionStatus === 'Attiva' 
                ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" 
                : "text-xs"
              }
            >
              {sessionStatus}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkSession}
          className="w-full bg-transparent border-green-500/30 hover:bg-green-500/10 text-green-400 text-xs h-8"
        >
          Verifica Sessione
        </Button>
      </div>
    </GlassModal>
  );
}

export default SettingsModal;


