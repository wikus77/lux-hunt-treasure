// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Unified Marker Reward Manager - WITH CLICK MAP

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/utils/auditLog';
import { 
  MapPin, Trash2, Gift, Coins, Search, 
  Zap, Trophy, MessageSquare, RefreshCw, Target, Loader2
} from 'lucide-react';

// Lazy load map component to avoid initialization issues
const SimpleClickMap = lazy(() => import('./SimpleClickMap'));

// Reward types
const REWARD_TYPES = [
  { value: 'M1U', label: 'M1U Credits', icon: Coins, color: '#FFD700' },
  { value: 'CLUE', label: 'Indizio', icon: Search, color: '#00D1FF' },
  { value: 'PHYSICAL_PRIZE', label: 'Premio Fisico', icon: Gift, color: '#FF1493' },
  { value: 'BUZZ_FREE', label: 'Buzz Gratuiti', icon: Zap, color: '#10B981' },
  { value: 'XP_POINTS', label: 'Punti XP', icon: Trophy, color: '#F59E0B' },
  { value: 'MESSAGE', label: 'Messaggio', icon: MessageSquare, color: '#8B5CF6' },
] as const;

const PHYSICAL_PRIZES = [
  'iPhone', 'AirPods', 'GoPro', 'USB Key', 'T-Shirt', 'Hat', 'PC', 
  'Apple Watch', 'M1 Kit', 'iPad', 'Powerbank', 'Smart Speaker',
  'Tech Backpack', 'Mousepad', 'Stickers', 'NFC/QR Keychain'
];

interface ExistingMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  active: boolean;
  created_at: string;
  rewards?: Array<{ reward_type: string; payload: any }>;
}

const MarkerRewardManager: React.FC = () => {
  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedRewardType, setSelectedRewardType] = useState('M1U');
  const [markerTitle, setMarkerTitle] = useState('');
  const [m1uAmount, setM1uAmount] = useState(50);
  const [clueText, setClueText] = useState('');
  const [physicalPrize, setPhysicalPrize] = useState('iPhone');
  const [buzzCount, setBuzzCount] = useState(1);
  const [xpPoints, setXpPoints] = useState(10);
  const [messageText, setMessageText] = useState('');
  const [visibilityHours, setVisibilityHours] = useState(24);
  const [minZoom, setMinZoom] = useState(17); // Zoom minimo per vedere il marker (17 = vicino, 10 = lontano)
  
  // Coordinates (manual input)
  const [lat, setLat] = useState('41.9028');
  const [lng, setLng] = useState('12.4964');
  
  // Bulk
  const [bulkCount, setBulkCount] = useState(25);
  const [bulkRewardType, setBulkRewardType] = useState('M1U');
  const [bulkM1uAmount, setBulkM1uAmount] = useState(50);
  const [bulkMinZoom, setBulkMinZoom] = useState(17); // Zoom minimo per bulk markers
  
  // Existing markers
  const [existingMarkers, setExistingMarkers] = useState<ExistingMarker[]>([]);
  const [showExisting, setShowExisting] = useState(true);

  // Handle location selection from map
  const handleLocationSelect = useCallback((newLat: number, newLng: number) => {
    setLat(newLat.toFixed(6));
    setLng(newLng.toFixed(6));
  }, []);

  // Check admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        setIsAdmin(!!profile && ['admin', 'owner'].some(r => 
          profile.role?.toLowerCase?.().includes(r)
        ));
      }
    };
    checkAdmin();
  }, []);

  // Load markers
  const loadMarkers = useCallback(async () => {
    try {
      console.log('📥 [MarkerManager] Loading markers from database...');
      
      // Include ALL markers (active or not) - no filter on active/visible
      const { data: markersData, error: markersError } = await supabase
        .from('markers')
        .select('id, lat, lng, title, active, created_at, visible_from, visible_to')
        .order('created_at', { ascending: false })
        .limit(200);

      if (markersError) {
        console.error('❌ [MarkerManager] Error loading markers:', markersError);
        return;
      }
      
      console.log('📥 [MarkerManager] Loaded markers:', markersData?.length || 0);

      if (!markersData || markersData.length === 0) {
        console.log('📥 [MarkerManager] No markers found in database');
        setExistingMarkers([]);
        return;
      }

      const markerIds = markersData.map(m => m.id);
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('marker_rewards')
        .select('marker_id, reward_type, payload')
        .in('marker_id', markerIds);

      if (rewardsError) {
        console.error('❌ [MarkerManager] Error loading rewards:', rewardsError);
      }
      
      console.log('📥 [MarkerManager] Loaded rewards:', rewardsData?.length || 0);

      const markers = markersData.map(m => ({
        ...m,
        rewards: (rewardsData || [])
          .filter(r => r.marker_id === m.id)
          .map(r => ({ reward_type: r.reward_type, payload: r.payload }))
      }));

      console.log('✅ [MarkerManager] Setting existingMarkers:', markers.length);
      setExistingMarkers(markers);
    } catch (error) {
      console.error('❌ [MarkerManager] Exception loading markers:', error);
    }
  }, []);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  // SIMPLIFIED: No complex map - just use iframe with OpenStreetMap

  // Build payload
  const buildPayload = () => {
    switch (selectedRewardType) {
      case 'M1U': return { amount: Math.min(1000, Math.max(10, m1uAmount)) };
      case 'CLUE': return { text: clueText, clue_type: 'location' };
      case 'PHYSICAL_PRIZE': return { prize_name: physicalPrize, description: `Premio: ${physicalPrize}` };
      case 'BUZZ_FREE': return { buzzCount };
      case 'XP_POINTS': return { xp: xpPoints };
      case 'MESSAGE': return { text: messageText };
      default: return {};
    }
  };

  // Create marker
  const handleCreateMarker = async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    console.log('🎯 [MarkerManager] Creating marker at:', { lat: latNum, lng: lngNum, title: markerTitle });
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Inserisci coordinate valide');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const visibleTo = new Date(now.getTime() + visibilityHours * 60 * 60 * 1000);

      console.log('🎯 [MarkerManager] Inserting into markers table...');
      const { data: marker, error: markerError } = await supabase
        .from('markers')
        .insert({
          lat: latNum,
          lng: lngNum,
          title: markerTitle || 'Reward Marker',
          active: true,
          visible_from: now.toISOString(),
          visible_to: visibleTo.toISOString()
        })
        .select()
        .single();

      if (markerError) {
        console.error('❌ [MarkerManager] Marker insert error:', markerError);
        throw markerError;
      }
      
      console.log('✅ [MarkerManager] Marker created:', marker);

      // Aggiungi min_zoom al payload
      const payloadWithZoom = {
        ...buildPayload(),
        min_zoom: minZoom
      };

      console.log('🎯 [MarkerManager] Inserting reward with payload:', payloadWithZoom);
      const { error: rewardError } = await supabase
        .from('marker_rewards')
        .insert({
          marker_id: marker.id,
          reward_type: selectedRewardType.toLowerCase(), // 🔥 IMPORTANTE: minuscolo per Edge Function
          payload: payloadWithZoom,
          description: `${REWARD_TYPES.find(r => r.value === selectedRewardType)?.label} reward`
        });

      if (rewardError) {
        console.error('❌ [MarkerManager] Reward insert error:', rewardError);
        throw rewardError;
      }
      
      console.log('✅ [MarkerManager] Reward created successfully!');

      // 🔐 Audit log for marker creation
      await logAuditEvent({
        event_type: 'MARKER_CREATED',
        severity: 'warning',
        details: { 
          marker_id: marker.id, 
          reward_type: selectedRewardType,
          lat: latNum.toFixed(4),
          lng: lngNum.toFixed(4)
        },
      });

      toast.success('✅ Marker creato!');
      console.log('🎯 [MarkerManager] SUCCESS! Marker ID:', marker.id, 'at:', marker.lat, marker.lng);
      console.log('🎯 [MarkerManager] Reloading markers list...');
      setMarkerTitle('');
      // Force a delay to ensure DB is updated
      setTimeout(() => {
        loadMarkers();
      }, 500);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete marker state
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Delete marker - USING EDGE FUNCTION (bypasses RLS) with full debug
  const handleDeleteMarker = async (markerId: string) => {
    if (!confirm(`Eliminare marker ${markerId.slice(0,8)}...?`)) return;

    console.log('🗑️ ========================================');
    console.log('🗑️ STARTING DELETE for marker:', markerId);
    
    // Mark as deleting
    setDeletingIds(prev => new Set([...prev, markerId]));

    try {
      // Call Edge Function with SERVICE_ROLE_KEY (bypasses RLS)
      console.log('🗑️ Calling Edge Function...');
      const { data, error } = await supabase.functions.invoke('admin-delete-marker', {
        body: { marker_id: markerId }
      });

      console.log('🗑️ ========================================');
      console.log('🗑️ Edge Function FULL response:');
      console.log('🗑️ data:', JSON.stringify(data, null, 2));
      console.log('🗑️ error:', error);
      
      // Show server logs in console
      if (data?.logs) {
        console.log('🗑️ SERVER LOGS:');
        data.logs.forEach((log: string) => console.log('   ', log));
      }
      console.log('🗑️ ========================================');

      if (error) {
        console.error('❌ Edge Function invoke error:', error);
        toast.error(`Errore chiamata: ${error.message}`);
        setDeletingIds(prev => { const n = new Set(prev); n.delete(markerId); return n; });
        return;
      }

      if (!data?.success) {
        console.error('❌ Delete operation failed:', data?.error);
        console.error('❌ Server logs:', data?.logs);
        toast.error(`Errore: ${data?.error || 'Eliminazione fallita'}`);
        setDeletingIds(prev => { const n = new Set(prev); n.delete(markerId); return n; });
        return;
      }

      // SUCCESS - Reload from server to confirm
      console.log('✅ SUCCESS! Reloading from server...');
      
      // 🔐 Audit log for marker deletion
      await logAuditEvent({
        event_type: 'MARKER_DELETED',
        severity: 'warning',
        details: { marker_id: markerId },
      });
      
      toast.success('✅ Eliminato! Ricarico lista...');
      setDeletingIds(prev => { const n = new Set(prev); n.delete(markerId); return n; });
      
      // Force reload from database after short delay
      setTimeout(() => {
        loadMarkers();
      }, 500);
      
    } catch (err: any) {
      console.error('❌ EXCEPTION:', err);
      toast.error(`Errore: ${err.message}`);
      setDeletingIds(prev => { const n = new Set(prev); n.delete(markerId); return n; });
    }
  };

  // Bulk create - uses secure Edge Function with required headers
  const handleBulkCreate = async () => {
    setIsLoading(true);
    try {
      // Generate a simple hash for security header (SHA-256 of timestamp + random)
      const hashInput = `${Date.now()}-${Math.random().toString(36)}`;
      const encoder = new TextEncoder();
      const data_bytes = encoder.encode(hashInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data_bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const codeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data, error } = await supabase.functions.invoke('create-random-markers', {
        body: {
          distributions: [{
            type: bulkRewardType,
            count: bulkCount,
            payload: bulkRewardType === 'M1U' 
              ? { amount: bulkM1uAmount, min_zoom: bulkMinZoom } 
              : { min_zoom: bulkMinZoom }
          }],
          // WORLDWIDE bbox - markers sparsi in tutto il mondo
          bbox: {
            minLat: -60,  // Esclude Antartide
            maxLat: 70,   // Esclude zone artiche estreme
            minLng: -180,
            maxLng: 180
          }
        },
        headers: {
          'X-M1-Dropper-Version': 'v1',
          'X-M1-Code-Hash': codeHash
        }
      });

      if (error) throw error;
      
      if (data?.partial_failures) {
        toast.warning(`⚠️ ${data.created} marker creati, ${data.partial_failures} falliti`);
      } else {
        toast.success(`✅ ${data?.created || bulkCount} marker creati!`);
      }
      loadMarkers();
    } catch (error: any) {
      console.error('Bulk create error:', error);
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>❌ Solo admin/owner possono accedere.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            🎯 Marker Reward Manager
          </h2>
          <p className="text-muted-foreground text-sm">Gestione marker reward</p>
        </div>
        <Button onClick={loadMarkers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card className="lg:row-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Mappa
            </CardTitle>
            <CardDescription>Clicca per selezionare posizione</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            {/* Interactive Click Map - BIGGER */}
            <div className="w-full h-[280px] rounded-lg overflow-hidden border border-slate-700">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              }>
                <SimpleClickMap
                  initialLat={parseFloat(lat) || 41.9028}
                  initialLng={parseFloat(lng) || 12.4964}
                  onLocationSelect={handleLocationSelect}
                  existingMarkers={showExisting ? existingMarkers.map(m => ({
                    id: m.id,
                    lat: m.lat,
                    lng: m.lng,
                    title: m.title,
                    reward_type: m.rewards?.[0]?.reward_type
                  })) : []}
                />
              </Suspense>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <Label className="text-xs">Latitudine</Label>
                <Input 
                  value={lat} 
                  onChange={e => setLat(e.target.value)}
                  placeholder="41.9028"
                />
              </div>
              <div>
                <Label className="text-xs">Longitudine</Label>
                <Input 
                  value={lng} 
                  onChange={e => setLng(e.target.value)}
                  placeholder="12.4964"
                />
              </div>
            </div>
            
            {lat && lng && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                <Target className="h-3 w-3 inline mr-1" />
                {lat}, {lng}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Config */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Configurazione</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">📍 Manuale</TabsTrigger>
                <TabsTrigger value="bulk">🎲 Bulk</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-3 mt-3">
                <div>
                  <Label>Titolo</Label>
                  <Input value={markerTitle} onChange={e => setMarkerTitle(e.target.value)} placeholder="Premio Roma" />
                </div>

                <div>
                  <Label>Tipo Premio</Label>
                  <Select value={selectedRewardType} onValueChange={setSelectedRewardType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REWARD_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <t.icon className="h-4 w-4 inline mr-2" style={{color: t.color}} />
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRewardType === 'M1U' && (
                  <div>
                    <Label>M1U (10-1000)</Label>
                    <Input type="number" min={10} max={1000} value={m1uAmount} onChange={e => setM1uAmount(+e.target.value || 50)} />
                  </div>
                )}

                {selectedRewardType === 'CLUE' && (
                  <div>
                    <Label>Indizio</Label>
                    <Textarea value={clueText} onChange={e => setClueText(e.target.value)} placeholder="Il tesoro..." rows={2} />
                  </div>
                )}

                {selectedRewardType === 'PHYSICAL_PRIZE' && (
                  <div>
                    <Label>Premio</Label>
                    <Select value={physicalPrize} onValueChange={setPhysicalPrize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PHYSICAL_PRIZES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedRewardType === 'BUZZ_FREE' && (
                  <div>
                    <Label>Buzz</Label>
                    <Input type="number" min={1} max={10} value={buzzCount} onChange={e => setBuzzCount(+e.target.value || 1)} />
                  </div>
                )}

                {selectedRewardType === 'XP_POINTS' && (
                  <div>
                    <Label>XP</Label>
                    <Input type="number" min={1} max={1000} value={xpPoints} onChange={e => setXpPoints(+e.target.value || 10)} />
                  </div>
                )}

                {selectedRewardType === 'MESSAGE' && (
                  <div>
                    <Label>Messaggio</Label>
                    <Textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={2} />
                  </div>
                )}

                <div>
                  <Label>Visibilità (ore)</Label>
                  <Input type="number" min={1} max={168} value={visibilityHours} onChange={e => setVisibilityHours(+e.target.value || 24)} />
                </div>

                <div>
                  <Label>Zoom Visibilità (10-20)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min={10} 
                      max={20} 
                      value={minZoom} 
                      onChange={e => setMinZoom(Math.min(20, Math.max(10, +e.target.value || 17)))} 
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {minZoom <= 12 ? '🔭 Molto visibile' : minZoom <= 15 ? '👁️ Visibile' : minZoom <= 17 ? '🔍 Vicino' : '🎯 Molto vicino'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zoom basso = più visibile da lontano | Zoom alto = devi avvicinarti
                  </p>
                </div>

                <Button onClick={handleCreateMarker} disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-pink-500">
                  {isLoading ? 'Creazione...' : '✨ Crea Marker'}
                </Button>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-3 mt-3">
                <div>
                  <Label>Quantità (1-100)</Label>
                  <Input type="number" min={1} max={100} value={bulkCount} onChange={e => setBulkCount(+e.target.value || 25)} />
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select value={bulkRewardType} onValueChange={setBulkRewardType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REWARD_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {bulkRewardType === 'M1U' && (
                  <div>
                    <Label>M1U per marker</Label>
                    <Input type="number" min={10} max={1000} value={bulkM1uAmount} onChange={e => setBulkM1uAmount(+e.target.value || 50)} />
                  </div>
                )}

                <div>
                  <Label>Zoom Visibilità (10-20)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min={10} 
                      max={20} 
                      value={bulkMinZoom} 
                      onChange={e => setBulkMinZoom(Math.min(20, Math.max(10, +e.target.value || 17)))} 
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {bulkMinZoom <= 12 ? '🔭 Molto visibile' : bulkMinZoom <= 15 ? '👁️ Visibile' : bulkMinZoom <= 17 ? '🔍 Vicino' : '🎯 Molto vicino'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zoom basso = più visibile da lontano | Zoom alto = devi avvicinarti
                  </p>
                </div>

                <Button onClick={handleBulkCreate} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                  {isLoading ? 'Generazione...' : `🎲 Genera ${bulkCount} Marker`}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Markers List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Marker ({existingMarkers.length})</span>
              <Switch checked={showExisting} onCheckedChange={setShowExisting} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {existingMarkers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nessun marker</p>
              ) : (
                existingMarkers.slice(0, 20).map(m => (
                  <div key={m.id} className={`flex items-center justify-between p-2 bg-muted/30 rounded border border-border/50 ${deletingIds.has(m.id) ? 'opacity-50' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${m.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm font-medium">{m.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {m.rewards?.map(r => r.reward_type).join(', ') || 'No rewards'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteMarker(m.id)} 
                      disabled={deletingIds.has(m.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      {deletingIds.has(m.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarkerRewardManager;
