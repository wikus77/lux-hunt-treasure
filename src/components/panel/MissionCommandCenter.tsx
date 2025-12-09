// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Mission Command Center - Container Unificato per gestione missioni

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ArrowLeft, Save, Rocket, MapPin, Gift, Users, 
  Wand2, Calendar, Settings, Target, AlertTriangle, CheckCircle,
  Clock, Loader2, Bell, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { logMissionConfigChange } from '@/utils/auditLog';

// ============================================
// TYPES
// ============================================

interface MissionConfig {
  id?: string;
  mission_name: string;
  mission_status: 'draft' | 'active' | 'completed' | 'archived';
  mission_started_at: string | null;
  mission_ends_at: string | null;
  // Location
  city: string;
  country: string;
  street: string;
  street_number: string;
  // Prize coordinates (for Final Shoot)
  prize_lat: number | null;
  prize_lng: number | null;
  // Prize details
  prize_name: string;
  prize_brand: string;
  prize_model: string;
  prize_type: string;
  prize_color: string;
  prize_material: string;
  prize_category: string;
  prize_size: string;
  prize_weight: string;
  prize_description: string;
  prize_value_estimate: string;
  prize_image_url: string;
  // Clues
  clues_generated: boolean;
  clues_count: number;
  linked_mission_id: string | null;
  // Meta
  is_active: boolean;
  created_at?: string;
}

interface MissionCommandCenterProps {
  onBack: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const PRIZE_TYPES = [
  'Orologio', 'Auto', 'Moto', 'Borsa', 'Gioiello', 'Smartphone', 'Laptop',
  'Tablet', 'TV', 'Elettrodomestico', 'Abbigliamento', 'Scarpe', 'Occhiali',
  'Profumo', 'Vino/Spirits', 'Viaggio', 'Esperienza', 'Voucher', 'Altro'
];

const PRIZE_COLORS = [
  'Oro', 'Argento', 'Platino', 'Nero', 'Bianco', 'Rosso', 'Blu', 'Verde',
  'Grigio', 'Marrone', 'Rosa', 'Viola', 'Arancione', 'Giallo', 'Beige',
  'Bronze', 'Titanio', 'Multicolore'
];

const PRIZE_MATERIALS = [
  'Oro 18K', 'Oro 24K', 'Oro Rosa', 'Argento 925', 'Platino', 'Acciaio Inossidabile',
  'Titanio', 'Carbonio', 'Pelle', 'Pelle di Coccodrillo', 'Pelle di Pitone',
  'Seta', 'Cotone', 'Lana', 'Cashmere', 'Vetro', 'Cristallo', 'Ceramica',
  'Diamanti', 'Rubini', 'Smeraldi', 'Zaffiri', 'Plastica', 'Gomma', 'Legno'
];

const PRIZE_CATEGORIES = [
  'Orologeria', 'Automotive', 'Moda', 'Gioielleria', 'Tech', 'Casa', 'Sport',
  'Viaggi', 'Food & Wine', 'Arte', 'Musica', 'Gaming', 'Benessere'
];

const DEFAULT_CONFIG: MissionConfig = {
  mission_name: '',
  mission_status: 'draft',
  mission_started_at: null,
  mission_ends_at: null,
  city: '',
  country: 'Italia',
  street: '',
  street_number: '',
  prize_lat: null,
  prize_lng: null,
  prize_name: '',
  prize_brand: '',
  prize_model: '',
  prize_type: '',
  prize_color: '',
  prize_material: '',
  prize_category: '',
  prize_size: '',
  prize_weight: '',
  prize_description: '',
  prize_value_estimate: '',
  prize_image_url: '',
  clues_generated: false,
  clues_count: 0,
  linked_mission_id: null,
  is_active: false,
};

// ============================================
// TABS
// ============================================

type TabId = 'config' | 'prize' | 'clues' | 'participants' | 'launch';

const TABS: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'config', label: 'Configurazione', icon: Settings, color: 'text-[#4361ee]' },
  { id: 'prize', label: 'Premio', icon: Gift, color: 'text-yellow-400' },
  { id: 'clues', label: 'Indizi', icon: Target, color: 'text-purple-400' },
  { id: 'participants', label: 'Partecipanti', icon: Users, color: 'text-green-400' },
  { id: 'launch', label: 'Lancia', icon: Rocket, color: 'text-red-400' },
];

// ============================================
// COMPONENT
// ============================================

const MissionCommandCenter: React.FC<MissionCommandCenterProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('config');
  const [config, setConfig] = useState<MissionConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingClues, setIsGeneratingClues] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [linkedMissions, setLinkedMissions] = useState<any[]>([]);

  // ============================================
  // LOAD DATA
  // ============================================

  const loadCurrentMission = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load current active mission config
      const { data, error } = await supabase
        .from('current_mission_data')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading mission:', error);
        toast.error('Errore nel caricamento della missione');
        return;
      }

      if (data) {
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          mission_name: data.mission_name || '',
          mission_status: data.mission_status || 'draft',
        });
      }

      // Load linked missions
      const { data: missions } = await supabase
        .from('missions')
        .select('id, title, status')
        .order('created_at', { ascending: false })
        .limit(10);

      if (missions) {
        setLinkedMissions(missions);
      }

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadParticipants = useCallback(async () => {
    if (!config.linked_mission_id) return;

    try {
      const { data, error, count } = await supabase
        .from('mission_enrollments')
        .select('*, profiles:user_id(username, agent_code, avatar_url)', { count: 'exact' })
        .eq('mission_id', config.linked_mission_id)
        .limit(50);

      if (error) throw error;
      setParticipants(data || []);
      setParticipantCount(count || 0);
    } catch (err) {
      console.error('Error loading participants:', err);
    }
  }, [config.linked_mission_id]);

  useEffect(() => {
    loadCurrentMission();
  }, [loadCurrentMission]);

  useEffect(() => {
    if (activeTab === 'participants') {
      loadParticipants();
    }
  }, [activeTab, loadParticipants]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleInputChange = (field: keyof MissionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessione non trovata');

      // Deactivate current active
      await supabase
        .from('current_mission_data')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert/Update mission config
      const payload = {
        ...config,
        is_active: true,
        created_by: session.user.id,
      };

      delete payload.id;
      delete payload.created_at;

      const { data, error } = await supabase
        .from('current_mission_data')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setConfig(prev => ({ ...prev, id: data.id }));
      
      // 🔐 Audit log for mission config change
      await logMissionConfigChange(
        session.user.id,
        'mission_config_update',
        config.id || 'new',
        data.id
      );
      
      toast.success('✅ Configurazione salvata!');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Errore nel salvataggio', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateClues = async () => {
    if (!config.city || !config.country) {
      toast.error('Inserisci almeno città e paese');
      return;
    }

    if (!config.prize_type) {
      toast.error('Seleziona il tipo di premio');
      return;
    }

    setIsGeneratingClues(true);
    try {
      // 🔧 FIX: Se non abbiamo un ID, prima salviamo la missione
      let missionId = config.linked_mission_id || config.id;
      
      if (!missionId) {
        console.log('⚠️ [MCC] No mission ID, saving first...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sessione non trovata');

        // Deactivate current active
        await supabase
          .from('current_mission_data')
          .update({ is_active: false })
          .eq('is_active', true);

        // Insert mission config
        const payload = {
          ...config,
          is_active: true,
          created_by: session.user.id,
        };
        delete (payload as any).id;
        delete (payload as any).created_at;

        const { data: savedMission, error: saveError } = await supabase
          .from('current_mission_data')
          .insert(payload)
          .select()
          .single();

        if (saveError) throw saveError;
        
        missionId = savedMission.id;
        setConfig(prev => ({ ...prev, id: savedMission.id }));
        console.log('✅ [MCC] Mission saved with ID:', missionId);
      }

      // Pass ALL prize details for intelligent clue generation
      const cluePayload = {
        prize_id: missionId,
        // Location
        city: config.city,
        country: config.country,
        region: '',
        street: config.street,
        // Prize details - ALL of them!
        prize_name: config.prize_name,
        prize_brand: config.prize_brand,
        prize_model: config.prize_model,
        prize_type: config.prize_type,
        prize_color: config.prize_color,
        prize_material: config.prize_material,
        prize_category: config.prize_category,
        prize_size: config.prize_size,
        prize_weight: config.prize_weight,
        prize_description: config.prize_description,
        prize_value_estimate: config.prize_value_estimate,
        // Coordinates for Final Shoot
        lat: config.prize_lat,
        lng: config.prize_lng,
      };

      console.log('🎯 Generating clues with payload:', cluePayload);

      const { data, error } = await supabase.functions.invoke('generate-mission-clues', {
        body: cluePayload,
      });

      console.log('🔍 [MCC] Response:', { data, error });

      if (error) {
        console.error('❌ [MCC] Edge function error:', error);
        throw new Error(`Edge Function error: ${error.message || JSON.stringify(error)}`);
      }

      if (data?.success) {
        setConfig(prev => ({
          ...prev,
          clues_generated: true,
          clues_count: data.breakdown?.total || 0,
        }));
        
        // Show sample clues if available
        if (data.sample_clues?.length > 0) {
          console.log('📝 Sample clues:', data.sample_clues);
        }
        
        toast.success(`✅ Generati ${data.breakdown?.total || 0} indizi intelligenti!`, {
          description: `${data.breakdown?.real_clues || 0} reali, ${data.breakdown?.fake_clues || 0} falsi`
        });
      } else {
        throw new Error(data?.error || 'Errore generazione');
      }
    } catch (err: any) {
      console.error('Generate clues error:', err);
      toast.error('Errore generazione indizi', { description: err.message });
    } finally {
      setIsGeneratingClues(false);
    }
  };

  const handleLaunchMission = async () => {
    // Validation
    if (!config.mission_name) {
      toast.error('❌ Inserisci il nome della missione');
      return;
    }
    if (!config.city || !config.country) {
      toast.error('❌ Inserisci la località del premio');
      return;
    }
    if (!config.prize_type) {
      toast.error('❌ Seleziona il tipo di premio');
      return;
    }
    if (!config.prize_lat || !config.prize_lng) {
      toast.error('❌ Inserisci le coordinate del premio per Final Shoot');
      return;
    }
    if (!config.clues_generated) {
      toast.error('❌ Genera gli indizi prima di lanciare la missione');
      return;
    }

    const confirmed = window.confirm(
      '🚀 LANCIA NUOVA MISSIONE?\n\n' +
      '⚠️ ATTENZIONE: Questa azione:\n' +
      '• RESETTERÀ i progressi di TUTTI gli utenti\n' +
      '• Azzererà indizi trovati, BUZZ, BUZZ MAP, timer\n' +
      '• Attiverà questa missione per tutti\n' +
      '• Invierà una notifica push a tutti\n\n' +
      'I dati della missione precedente verranno archiviati.\n\n' +
      'Sei SICURO di voler procedere?'
    );

    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirm = window.confirm(
      '⚠️ CONFERMA FINALE ⚠️\n\n' +
      `Stai per lanciare: "${config.mission_name}"\n\n` +
      'TUTTI i progressi degli utenti verranno AZZERATI.\n' +
      'Questa azione NON può essere annullata.\n\n' +
      'Confermi?'
    );

    if (!doubleConfirm) return;

    setIsLaunching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessione non trovata');

      // 1. Save config first
      await handleSave();

      // 2. Call the new Edge Function that handles EVERYTHING
      console.log('🚀 [MCC] Calling launch-new-mission Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('launch-new-mission', {
        body: {
          mission_id: config.linked_mission_id || config.id,
          mission_name: config.mission_name,
          send_push: true,
        },
      });

      if (error) {
        console.error('❌ [MCC] Launch error:', error);
        throw new Error(error.message || 'Errore nel lancio della missione');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Errore sconosciuto nel lancio');
      }

      console.log('✅ [MCC] Launch successful:', data);

      // 3. Update local state
      setConfig(prev => ({
        ...prev,
        mission_status: 'active',
        mission_started_at: new Date().toISOString(),
      }));

      toast.success('🚀 MISSIONE LANCIATA!', {
        description: `${data.reset_result?.users_reset || 'Tutti'} utenti resettati. Notifica inviata.`,
      });

      // 🔥 FIX: Dispatch event to notify all components (BUZZ MAP, Home, etc.)
      console.log('📢 [MCC] Dispatching missionLaunched event...');
      window.dispatchEvent(new CustomEvent('missionLaunched', {
        detail: {
          mission_id: config.linked_mission_id || config.id,
          mission_name: config.mission_name,
          reset_result: data.reset_result,
        }
      }));

    } catch (err: any) {
      console.error('Launch error:', err);
      toast.error('Errore nel lancio della missione', { description: err.message });
    } finally {
      setIsLaunching(false);
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🟢 ATTIVA</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">📝 BOZZA</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">✅ COMPLETATA</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">📦 ARCHIVIATA</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // ============================================
  // RENDER TABS
  // ============================================

  const renderConfigTab = () => (
    <div className="space-y-6">
      {/* Mission Info */}
      <Card className="glass-card border-[#4361ee]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#4361ee]" />
            Informazioni Missione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome Missione *</Label>
              <Input
                value={config.mission_name}
                onChange={(e) => handleInputChange('mission_name', e.target.value)}
                placeholder="es. M1SSION Dicembre 2025"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <div className="pt-2">
                {getStatusBadge(config.mission_status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Data Inizio</Label>
              <Input
                type="datetime-local"
                value={config.mission_started_at ? new Date(config.mission_started_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('mission_started_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Data Fine</Label>
              <Input
                type="datetime-local"
                value={config.mission_ends_at ? new Date(config.mission_ends_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('mission_ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Collega a Missione (opzionale)</Label>
            <Select 
              value={config.linked_mission_id || 'none'} 
              onValueChange={(value) => handleInputChange('linked_mission_id', value === 'none' ? null : value)}
            >
              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                <SelectValue placeholder="Seleziona missione esistente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna</SelectItem>
                {linkedMissions.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="glass-card border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Ubicazione Premio
          </CardTitle>
          <CardDescription>Dove si trova fisicamente il premio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Città *</Label>
              <Input
                value={config.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="es. Milano"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Paese *</Label>
              <Input
                value={config.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="es. Italia"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Via</Label>
              <Input
                value={config.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="es. Via Montenapoleone"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Numero Civico</Label>
              <Input
                value={config.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
                placeholder="es. 12A"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Coordinates for Final Shoot */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Coordinate Esatte (per Final Shoot)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Latitudine</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={config.prize_lat || ''}
                  onChange={(e) => handleInputChange('prize_lat', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="es. 45.464664"
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Longitudine</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={config.prize_lng || ''}
                  onChange={(e) => handleInputChange('prize_lng', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="es. 9.188540"
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Queste coordinate determinano il punto esatto per Final Shoot (tolleranza 19m)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrizeTab = () => (
    <div className="space-y-6">
      <Card className="glass-card border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Dettagli Premio
          </CardTitle>
          <CardDescription>
            Inserisci TUTTE le informazioni del premio per generare indizi accurati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome Premio</Label>
              <Input
                value={config.prize_name}
                onChange={(e) => handleInputChange('prize_name', e.target.value)}
                placeholder="es. Rolex Submariner"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Marca</Label>
              <Input
                value={config.prize_brand}
                onChange={(e) => handleInputChange('prize_brand', e.target.value)}
                placeholder="es. Rolex"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Modello</Label>
              <Input
                value={config.prize_model}
                onChange={(e) => handleInputChange('prize_model', e.target.value)}
                placeholder="es. Submariner Date 126610LN"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Type, Color, Material, Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Tipo Premio *</Label>
              <Select value={config.prize_type || undefined} onValueChange={(v) => handleInputChange('prize_type', v)}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Seleziona tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Categoria</Label>
              <Select value={config.prize_category || undefined} onValueChange={(v) => handleInputChange('prize_category', v)}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Seleziona categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Colore</Label>
              <Select value={config.prize_color || undefined} onValueChange={(v) => handleInputChange('prize_color', v)}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Seleziona colore..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Materiale</Label>
              <Select value={config.prize_material || undefined} onValueChange={(v) => handleInputChange('prize_material', v)}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="Seleziona materiale..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIZE_MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Physical characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Dimensioni</Label>
              <Input
                value={config.prize_size}
                onChange={(e) => handleInputChange('prize_size', e.target.value)}
                placeholder="es. 41mm diametro"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Peso</Label>
              <Input
                value={config.prize_weight}
                onChange={(e) => handleInputChange('prize_weight', e.target.value)}
                placeholder="es. 155g"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Valore Stimato</Label>
              <Input
                value={config.prize_value_estimate}
                onChange={(e) => handleInputChange('prize_value_estimate', e.target.value)}
                placeholder="es. €15.000"
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Descrizione Dettagliata</Label>
            <Textarea
              value={config.prize_description}
              onChange={(e) => handleInputChange('prize_description', e.target.value)}
              placeholder="Descrivi il premio in dettaglio: caratteristiche uniche, storia, particolarità..."
              rows={4}
              className="bg-black/30 border-white/20 text-white"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label className="text-gray-300">URL Immagine Premio</Label>
            <Input
              value={config.prize_image_url}
              onChange={(e) => handleInputChange('prize_image_url', e.target.value)}
              placeholder="https://..."
              className="bg-black/30 border-white/20 text-white"
            />
            {config.prize_image_url && (
              <img 
                src={config.prize_image_url} 
                alt="Premio" 
                className="mt-2 w-32 h-32 object-cover rounded-lg border border-white/20"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCluesTab = () => (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Generazione Indizi AI
          </CardTitle>
          <CardDescription>
            Genera automaticamente 400 indizi basati su località e premio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-black/30">
            {config.clues_generated ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold">✅ Indizi Generati</p>
                  <p className="text-gray-400 text-sm">{config.clues_count} indizi creati</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-semibold">⚠️ Indizi Non Generati</p>
                  <p className="text-gray-400 text-sm">Clicca il bottone per generare</p>
                </div>
              </>
            )}
          </div>

          {/* Requirements check */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Requisiti per generazione:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${config.city ? 'text-green-400' : 'text-red-400'}`}>
                {config.city ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                Città: {config.city || 'Mancante'}
              </div>
              <div className={`flex items-center gap-2 ${config.country ? 'text-green-400' : 'text-red-400'}`}>
                {config.country ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                Paese: {config.country || 'Mancante'}
              </div>
              <div className={`flex items-center gap-2 ${config.prize_type ? 'text-green-400' : 'text-red-400'}`}>
                {config.prize_type ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                Tipo: {config.prize_type || 'Mancante'}
              </div>
              <div className={`flex items-center gap-2 ${config.prize_color ? 'text-green-400' : 'text-gray-400'}`}>
                {config.prize_color ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                Colore: {config.prize_color || 'Opzionale'}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateClues}
            disabled={isGeneratingClues || !config.city || !config.country || !config.prize_type}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGeneratingClues ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                {config.clues_generated ? 'RIGENERA INDIZI' : 'GENERA 400 INDIZI'}
              </>
            )}
          </Button>

          {config.clues_generated && (
            <p className="text-xs text-gray-500 text-center">
              ⚠️ Rigenerare gli indizi sovrascriverà quelli esistenti
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderParticipantsTab = () => (
    <div className="space-y-6">
      <Card className="glass-card border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Partecipanti ({participantCount})
          </CardTitle>
          <CardDescription>
            Utenti iscritti alla missione
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!config.linked_mission_id ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Collega una missione per vedere i partecipanti</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun partecipante iscritto</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                  <span className="text-gray-500 w-6">{i + 1}.</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7]" />
                  <div className="flex-1">
                    <p className="text-white text-sm">{p.profiles?.username || p.profiles?.agent_code || 'Agente'}</p>
                    <p className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderLaunchTab = () => (
    <div className="space-y-6">
      <Card className="glass-card border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-red-400" />
            🚀 LANCIA MISSIONE
          </CardTitle>
          <CardDescription>
            Attiva la missione e notifica tutti gli utenti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Checklist Pre-Lancio:</h4>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.mission_name ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {config.mission_name ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span className={config.mission_name ? 'text-green-400' : 'text-red-400'}>
                Nome Missione: {config.mission_name || '❌ Non configurato'}
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.city && config.country ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {config.city && config.country ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span className={config.city && config.country ? 'text-green-400' : 'text-red-400'}>
                Località: {config.city && config.country ? `${config.city}, ${config.country}` : '❌ Non configurata'}
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.prize_lat && config.prize_lng ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {config.prize_lat && config.prize_lng ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span className={config.prize_lat && config.prize_lng ? 'text-green-400' : 'text-red-400'}>
                Coordinate Final Shoot: {config.prize_lat && config.prize_lng ? `${config.prize_lat}, ${config.prize_lng}` : '❌ Non configurate'}
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.prize_type ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {config.prize_type ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span className={config.prize_type ? 'text-green-400' : 'text-red-400'}>
                Premio: {config.prize_type || '❌ Non configurato'}
              </span>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.clues_generated ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {config.clues_generated ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
              <span className={config.clues_generated ? 'text-green-400' : 'text-red-400'}>
                Indizi: {config.clues_generated ? `✅ ${config.clues_count} generati` : '❌ Non generati'}
              </span>
            </div>
          </div>

          {/* Launch Actions */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-sm text-gray-400">
              Quando lanci la missione:
            </p>
            <ul className="text-sm text-gray-400 space-y-1 ml-4">
              <li>• Lo status cambierà da "START M1SSION" a "ON M1SSION"</li>
              <li>• Tutti gli utenti riceveranno una notifica push</li>
              <li>• La Home, Buzz Map, AION e Leaderboard si aggiorneranno</li>
              <li>• Gli indizi diventeranno accessibili ai giocatori</li>
              <li>• Final Shoot sarà disponibile negli ultimi 7 giorni</li>
            </ul>
          </div>

          {/* Launch Button */}
          <Button
            onClick={handleLaunchMission}
            disabled={
              isLaunching || 
              !config.mission_name || 
              !config.city || 
              !config.country || 
              !config.prize_type ||
              !config.prize_lat ||
              !config.prize_lng ||
              !config.clues_generated
            }
            className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                LANCIO IN CORSO...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                🚀 LANCIA MISSIONE
              </>
            )}
          </Button>

          {config.mission_status === 'active' && (
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold">MISSIONE ATTIVA!</p>
              <p className="text-gray-400 text-sm">Lanciata il {config.mission_started_at ? new Date(config.mission_started_at).toLocaleString('it-IT') : '-'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8 text-[#4361ee]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] p-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="glass-card p-2 border border-white/20 hover:border-[#7209b7]/50"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#7209b7] to-[#4361ee] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-orbitron font-bold text-white">
                    Mission Command Center
                  </h1>
                  <p className="text-gray-400">Pannello unificato gestione missioni</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#4361ee] to-[#7209b7]"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salva
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                className={`glass-card border transition-all ${
                  activeTab === tab.id
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${tab.color}`} />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'config' && renderConfigTab()}
              {activeTab === 'prize' && renderPrizeTab()}
              {activeTab === 'clues' && renderCluesTab()}
              {activeTab === 'participants' && renderParticipantsTab()}
              {activeTab === 'launch' && renderLaunchTab()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MissionCommandCenter;

