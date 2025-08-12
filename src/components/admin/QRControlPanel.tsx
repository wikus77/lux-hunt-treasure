// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QrCode, MapPin, Gift, AlertTriangle, Calendar, BarChart3, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCodeLib from 'qrcode';
import jsPDF from 'jspdf';
import { QRInlineMap } from './QRInlineMap';

interface QRCode {
  id: string;
  reward_type: string;
  message: string;
  lat: number;
  lon: number;
  location_name: string;
  max_distance_meters: number;
  attivo: boolean;
  scansioni: number;
  redeemed_by: string[];
  expires_at?: string | null;
  creato_da: string;
  created_at: string;
  updated_at: string;
}

interface QRStats {
  totalActive: number;
  totalRedeemed: number;
  buzzRewards: number;
  clueRewards: number;
  enigmaRewards: number;
  fakeRewards: number;
  failedAttempts: number;
}

export const QRControlPanel = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [stats, setStats] = useState<QRStats>({
    totalActive: 0,
    totalRedeemed: 0,
    buzzRewards: 0,
    clueRewards: 0,
    enigmaRewards: 0,
    fakeRewards: 0,
    failedAttempts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
// Form state
  const [formData, setFormData] = useState({
    locationName: '',
    lat: '', // UI display (6 decimals)
    lng: '', // UI display (6 decimals)
    rewardType: 'buzz_credit' as 'buzz_credit' | 'custom',
    rewardContent: '',
    expiresAt: ''
  });
  // Full-precision coordinates kept separately
  const [latFull, setLatFull] = useState<number | null>(null);
  const [lngFull, setLngFull] = useState<number | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('qr_admin_list');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setQrCodes(parsed);
          setIsLoading(false);
        }
      }
    } catch {}

    loadQRCodes();
    loadStats();
  }, []);

  // Persist current list on unmount for quick return
  useEffect(() => {
    return () => {
      try { localStorage.setItem('qr_admin_list', JSON.stringify(qrCodes)); } catch {}
    };
  }, [qrCodes]);

const loadQRCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('code, reward_type, lat, lng, title, is_active, expires_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped: QRCode[] = (data || []).map((row: any) => ({
      id: row.code,
      reward_type: row.reward_type,
      message: '',
      lat: row.lat,
      lon: row.lng,
      location_name: row.title || '',
      max_distance_meters: 100,
      attivo: row.is_active ?? true,
      scansioni: row.is_active ? 0 : 1,
      redeemed_by: [],
      expires_at: row.expires_at,
      creato_da: '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    setQrCodes(mapped);
    try { localStorage.setItem('qr_admin_list', JSON.stringify(mapped)); } catch {}
  } catch (error) {
    console.error('Error loading QR codes:', error);
    toast.error('Errore nel caricamento dei QR code');
  } finally {
    setIsLoading(false);
  }
};

const loadStats = async () => {
  try {
    // Get basic stats from qr_codes
    const { data: allCodes, error: codesError } = await supabase
      .from('qr_codes')
      .select('is_active, reward_type');

    if (codesError) throw codesError;

    const totalActive = allCodes?.filter((c: any) => c.is_active === true).length || 0;
    const totalRedeemed = allCodes?.filter((c: any) => c.is_active !== true).length || 0;
    const buzzRewards = allCodes?.filter((c: any) => c.reward_type === 'buzz_credit').length || 0;
    const clueRewards = 0;
    const enigmaRewards = 0;
    const fakeRewards = allCodes?.filter((c: any) => c.reward_type === 'custom').length || 0;

    setStats({
      totalActive,
      totalRedeemed,
      buzzRewards,
      clueRewards,
      enigmaRewards,
      fakeRewards,
      failedAttempts: 0
    });
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const generateQRCode = async () => {
    // Validazioni base
    if (!formData.locationName.trim()) {
      toast.error('⚠️ Titolo/Nome posizione obbligatorio');
      return;
    }

    const latNum = (latFull ?? (formData.lat ? parseFloat(formData.lat.replace(',', '.')) : NaN));
    const lngNum = (lngFull ?? (formData.lng ? parseFloat(formData.lng.replace(',', '.')) : NaN));

    if (!isFinite(latNum)) {
      toast.error('⚠️ Latitudine non valida (es: 45.464664)');
      return;
    }
    if (!isFinite(lngNum)) {
      toast.error('⚠️ Longitudine non valida (es: 9.188540)');
      return;
    }
    if (latNum < -90 || latNum > 90) {
      toast.error('⚠️ Latitudine deve essere tra -90 e 90');
      return;
    }
    if (lngNum < -180 || lngNum > 180) {
      toast.error('⚠️ Longitudine deve essere tra -180 e 180');
      return;
    }
    if (!formData.rewardType) {
      toast.error('⚠️ Tipo reward obbligatorio');
      return;
    }
    if (formData.rewardType === 'custom' && !formData.rewardContent.trim()) {
      toast.warning('⚠️ Nessun messaggio personalizzato: proseguo comunque');
    }

    try {
      setIsCreating(true);

      const payload = {
        title: formData.locationName || 'QR Manuale',
        reward_type: formData.rewardType,
        lat: latNum,
        lng: lngNum,
        message: formData.rewardContent || null,
        expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const { data, error } = await supabase.functions.invoke('create_qr_code', { body: payload });
      if (error) throw new Error(error.message || 'Errore funzione');
      const created = data as any;

      // Aggiorna lista locale (no refetch pesante) + cache
      const newItem: QRCode = {
        id: created.code, // usiamo il code come id visualizzato/di stampa
        reward_type: created.reward_type,
        message: created.message || '',
        lat: created.lat,
        lon: created.lng,
        location_name: created.title || payload.title,
        max_distance_meters: 100,
        attivo: created.is_active ?? true,
        scansioni: 0,
        redeemed_by: [],
        expires_at: created.expires_at,
        creato_da: 'me',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as QRCode;
      const updatedList = [newItem, ...qrCodes];
      setQrCodes(updatedList);
      try { localStorage.setItem('qr_admin_list', JSON.stringify(updatedList)); } catch {}

      // Reset form (mantieni mappa pulita)
      setFormData({ locationName: '', lat: '', lng: '', rewardType: 'buzz_credit', rewardContent: '', expiresAt: '' });
      setLatFull(null);
      setLngFull(null);

      // Apri modale stampa esistente con il nuovo codice
      showQRForPrinting(created.code, { rewardType: created.reward_type, locationName: created.title });
    } catch (e: any) {
      console.error('Error creating QR code:', e);
      toast.error('Errore nella creazione del QR code');
    } finally {
      setIsCreating(false);
    }
  };

  // 🔥 FIXED: Advanced QR Generation with M1 Logo and Reward Message
  const generatePrintableQR = async (code: string, rewardMessage: string) => {
    // 🎯 CRITICAL FIX: Use UUID for both validate and direct routes - iOS Safari compatibility
    const qrUrl = `https://m1ssion.eu/qr/${code}`;
    
    console.log('🔥 GENERATING QR FOR URL:', qrUrl);
    
    try {
      // Generate QR Code with high quality
      const qrDataUrl = await QRCodeLib.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction for logo overlay
      });

      // Create canvas for logo overlay
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;

      // Load QR code image
      const qrImg = new Image();
      qrImg.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, 512, 512);
        
        // Draw M1 logo overlay (center)
        const logoSize = 80;
        const logoX = (512 - logoSize) / 2;
        const logoY = (512 - logoSize) / 2;
        
        // White background for logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        
        // M1 text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M1', 256, 256);
        
        // Generate final image
        const finalDataUrl = canvas.toDataURL('image/png');
        
        // Create PDF
        generatePDF(finalDataUrl, code, rewardMessage);
        
        // Show preview modal
        showQRPreview(finalDataUrl, code, rewardMessage);
      };
      qrImg.src = qrDataUrl;
      
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Errore nella generazione del QR Code');
    }
  };

  const generatePDF = (qrDataUrl: string, code: string, rewardMessage: string) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, 210, 297, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('M1SSION™', 105, 40, { align: 'center' });

    // Subtitle
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(14);
    pdf.text('TOP SECRET QR CODE', 105, 55, { align: 'center' });

    // QR Code (centered)
    const qrSize = 120;
    const qrX = (210 - qrSize) / 2;
    const qrY = 80;
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Reward Message (no location shown)
    pdf.setTextColor(0, 209, 255); // Cyan glow color
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(rewardMessage || 'REWARD CLASIFICATO', 105, qrY + qrSize + 20, { align: 'center' });

    // Code
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text(code, 105, qrY + qrSize + 35, { align: 'center' });

    // Warning
    pdf.setTextColor(255, 100, 100);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⚠️ REWARD CLASSIFICATO', 105, qrY + qrSize + 50, { align: 'center' });

    // Border
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, 190, 277);

    // Save
    pdf.save(`M1SSION_QR_${code}.pdf`);
    toast.success('PDF generato e scaricato!');
  };

  const showQRPreview = (qrDataUrl: string, code: string, rewardMessage: string) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="
        background: #000;
        border: 2px solid #00a3ff;
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 0 50px rgba(0, 163, 255, 0.5);
      ">
        <h2 style="color: #00a3ff; margin-bottom: 20px; font-size: 24px;">
          <span style="color: #00FFFF; text-shadow: 0 0 10px #00FFFF;">M1</span><span style="color: #FFFFFF;">SSION™</span> QR CODE
        </h2>
        <img src="${qrDataUrl}" style="width: 300px; height: 300px; border-radius: 10px; margin-bottom: 20px;" />
        <p style="color: #00FFFF; font-size: 16px; margin-bottom: 5px; text-shadow: 0 0 5px #00FFFF;">${rewardMessage || 'REWARD CLASIFICATO'}</p>
        <p style="color: #999; font-size: 12px; font-family: monospace; margin-bottom: 20px;">${code}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="printBtn" style="
            background: #00a3ff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
          ">🖨️ Stampa</button>
          <button id="closeBtn" style="
            background: #666;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
          ">Chiudi</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#printBtn')?.addEventListener('click', () => {
      window.print();
    });

    modal.querySelector('#closeBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

const showQRForPrinting = (code: string, formData: any) => {
    let rewardMessage = 'REWARD CLASIFICATO';
    const rewardType = formData.rewardType || formData.reward_type;

    switch (rewardType) {
      case 'buzz':
      case 'buzz_gratis':
      case 'buzz_credit':
        rewardMessage = '⚡ BUZZ GRATUITO';
        break;
      case 'clue':
      case 'indizio_segreto':
        rewardMessage = '🔍 INDIZIO SEGRETO';
        break;
      case 'enigma':
      case 'enigma_misterioso':
        rewardMessage = '🧩 ENIGMA MISTERIOSO';
        break;
      case 'fake':
      case 'sorpresa_speciale':
        rewardMessage = '🌀 SORPRESA SPECIALE';
        break;
      case 'custom':
        rewardMessage = '🎁 REWARD PERSONALIZZATO';
        break;
    }
    generatePrintableQR(code, rewardMessage);
  };

  const deleteQR = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo QR Code? Questa azione non può essere annullata.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('qr_rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`QR Code ${id} eliminato con successo`);
      loadQRCodes();
      loadStats();
    } catch (error) {
      console.error('Error deleting QR:', error);
      toast.error('Errore nell\'eliminazione del QR code');
    }
  };

const getRewardIcon = (type: string) => {
    switch (type) {
      case 'buzz_gratis':
      case 'buzz_credit': return '⚡';
      case 'indizio_segreto': return '🔍';
      case 'enigma_misterioso': return '🧩';
      case 'sorpresa_speciale': return '🌀';
      case 'custom': return '🎁';
      default: return '❓';
    }
  };

const getRewardColor = (type: string) => {
    switch (type) {
      case 'buzz_gratis':
      case 'buzz_credit': return 'bg-green-100 text-green-800';
      case 'indizio_segreto': return 'bg-blue-100 text-blue-800';
      case 'enigma_misterioso': return 'bg-purple-100 text-purple-800';
      case 'sorpresa_speciale':
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <QrCode className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">QR Control Panel</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalActive}</div>
            <div className="text-sm text-muted-foreground">QR Attivi</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRedeemed}</div>
            <div className="text-sm text-muted-foreground">Riscattati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.buzzRewards}</div>
            <div className="text-sm text-muted-foreground">Buzz Dati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failedAttempts}</div>
            <div className="text-sm text-muted-foreground">Tentativi Falliti</div>
          </CardContent>
        </Card>
      </div>

      {/* Create New QR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Crea Nuovo QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locationName">Nome Posizione *</Label>
              <Input
                id="locationName"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="es. Berlino - Alexanderplatz"
              />
            </div>
            <div>
<Label htmlFor="rewardType">Tipo Reward *</Label>
              <Select value={formData.rewardType} onValueChange={(value: any) => setFormData({ ...formData, rewardType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[300px] overflow-y-auto bg-card border border-border shadow-xl backdrop-blur-md">
                  <SelectItem value="buzz_credit" className="cursor-pointer py-3 px-4 text-base font-medium hover:bg-accent focus:bg-accent">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span>Buzz Credit</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom" className="cursor-pointer py-3 px-4 text-base font-medium hover:bg-accent focus:bg-accent">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎁</span>
                      <span>Custom</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
<Label htmlFor="lat">Latitudine * <span className="text-xs text-gray-500">(-90 a +90)</span></Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, lat: v });
                  const num = parseFloat(v);
                  if (isFinite(num)) setLatFull(num);
                }}
                placeholder="45.464664 (Milano)"
                className={!formData.lat || isNaN(parseFloat(formData.lat)) ? 'border-red-300' : 'border-green-300'}
              />
              {formData.lat && isNaN(parseFloat(formData.lat)) && (
                <div className="text-xs text-red-500 mt-1">⚠️ Valore non valido</div>
              )}
            </div>
            <div>
              <Label htmlFor="lng">Longitudine * <span className="text-xs text-gray-500">(-180 a +180)</span></Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, lng: v });
                  const num = parseFloat(v);
                  if (isFinite(num)) setLngFull(num);
                }}
                placeholder="9.188540 (Milano)"
                className={!formData.lng || isNaN(parseFloat(formData.lng)) ? 'border-red-300' : 'border-green-300'}
              />
              {formData.lng && isNaN(parseFloat(formData.lng)) && (
                <div className="text-xs text-red-500 mt-1">⚠️ Valore non valido</div>
              )}
            </div>
          </div>
          
{/* 🔥 COORDINATE HELPER */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">📍 Coordinate Esempio:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <strong>Berlin:</strong> 52.520008, 13.404954<br/>
                <strong>Milano:</strong> 45.464664, 9.188540<br/>
                <strong>Roma:</strong> 41.902782, 12.496365
              </div>
              <div>
                <strong>Parigi:</strong> 48.856614, 2.352222<br/>
                <strong>Monaco:</strong> 43.740070, 7.426540<br/>
                <strong>Monaco:</strong> 48.137154, 11.576124
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 Usa Google Maps per ottenere coordinate precise: click destro → "Cosa c'è qui?"
            </div>
          </div>

          {/* Inline Map for picking coordinates */}
          <QRInlineMap
            lat={latFull ?? (formData.lat ? parseFloat(formData.lat) : undefined)}
            lng={lngFull ?? (formData.lng ? parseFloat(formData.lng) : undefined)}
            onChange={(la, lo) => {
              setLatFull(la);
              setLngFull(lo);
              setFormData((s) => ({ ...s, lat: la.toFixed(6), lng: lo.toFixed(6) }));
            }}
          />

{(formData.rewardType === 'custom') && (
            <div>
              <Label htmlFor="rewardContent">Messaggio (opzionale)</Label>
              <Textarea
                id="rewardContent"
                value={formData.rewardContent}
                onChange={(e) => setFormData({ ...formData, rewardContent: e.target.value })}
                placeholder={'Inserisci il messaggio personalizzato...'}
                rows={3}
              />
            </div>
          )}

          <div>
            <Label htmlFor="expiresAt">Data Scadenza (opzionale)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          <Button onClick={generateQRCode} disabled={isCreating} className="w-full">
            {isCreating ? 'Creando...' : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Genera QR Code + Stampa Adesivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            QR Codes Gestiti ({qrCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun QR code creato
            </div>
          ) : (
            <div className="space-y-3">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-lg">{qr.id}</span>
                      <Badge className={getRewardColor(qr.reward_type)}>
                        {getRewardIcon(qr.reward_type)} {qr.reward_type.toUpperCase()}
                      </Badge>
                      {!qr.attivo ? (
                        <Badge variant="secondary">DISATTIVATO</Badge>
                      ) : qr.scansioni > 0 ? (
                        <Badge variant="outline">SCANSIONATO ({qr.scansioni})</Badge>
                      ) : (
                        <Badge variant="default">ATTIVO</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {qr.location_name} ({qr.lat.toFixed(6)}, {qr.lon.toFixed(6)})
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Creato: {new Date(qr.created_at).toLocaleDateString('it-IT')}
                        {qr.expires_at && (
                          <span className="ml-2">
                            • Scade: {new Date(qr.expires_at).toLocaleDateString('it-IT')}
                          </span>
                        )}
                      </div>
                      {qr.scansioni > 0 && (
                        <div className="text-green-600 mt-1">
                          Scansioni: {qr.scansioni} • Ultimo aggiornamento: {new Date(qr.updated_at).toLocaleDateString('it-IT')}
                        </div>
                      )}
                      {qr.message && (
                        <div className="text-blue-600 mt-1 text-xs">
                          Messaggio: {qr.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showQRForPrinting(qr.id, { rewardType: qr.reward_type, locationName: qr.location_name })}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteQR(qr.id)}
                      title="Elimina QR Code"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};