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

interface QRCode {
  id: string;
  code: string;
  location_name: string;
  lat: number;
  lng: number;
  reward_type: string;
  reward_content: any;
  is_used: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  used_by?: string;
  used_at?: string;
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
    lat: '',
    lng: '',
    rewardType: 'buzz' as 'buzz' | 'clue' | 'enigma' | 'fake',
    rewardContent: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadQRCodes();
    loadStats();
  }, []);

  const loadQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_buzz_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast.error('Errore nel caricamento dei QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get basic stats
      const { data: allCodes, error: codesError } = await supabase
        .from('qr_buzz_codes')
        .select('is_used, reward_type');

      if (codesError) throw codesError;

      // Get failed attempts
      const { count: failedCount, error: failedError } = await supabase
        .from('qr_redemption_logs')
        .select('*', { count: 'exact', head: true })
        .eq('success', false);

      if (failedError) throw failedError;

      const codes = allCodes || [];
      const active = codes.filter(c => !c.is_used);
      const redeemed = codes.filter(c => c.is_used);

      setStats({
        totalActive: active.length,
        totalRedeemed: redeemed.length,
        buzzRewards: redeemed.filter(c => c.reward_type === 'buzz').length,
        clueRewards: redeemed.filter(c => c.reward_type === 'clue').length,
        enigmaRewards: redeemed.filter(c => c.reward_type === 'enigma').length,
        fakeRewards: redeemed.filter(c => c.reward_type === 'fake').length,
        failedAttempts: failedCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateQRCode = async () => {
    // 🔥 FIX: Validazione corretta per form fields
    if (!formData.locationName.trim()) {
      toast.error('⚠️ Inserisci un nome per la posizione');
      return;
    }
    
    if (!formData.lat || isNaN(parseFloat(formData.lat))) {
      toast.error('⚠️ Inserisci una latitudine valida');
      return;
    }
    
    if (!formData.lng || isNaN(parseFloat(formData.lng))) {
      toast.error('⚠️ Inserisci una longitudine valida');
      return;
    }
    
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    
    if (lat < -90 || lat > 90) {
      toast.error('⚠️ Latitudine deve essere tra -90 e 90');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      toast.error('⚠️ Longitudine deve essere tra -180 e 180');
      return;
    }
    
    console.log('🔥 QR GENERATION DEBUG:', {
      locationName: formData.locationName,
      lat: lat,
      lng: lng,
      rewardType: formData.rewardType,
      rewardContent: formData.rewardContent
    });

    try {
      setIsCreating(true);

      // Generate unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_qr_code');

      if (codeError) throw codeError;

      const newCode = codeData;

      // Prepare reward content
      let rewardContent = {};
      if (formData.rewardType === 'clue' && formData.rewardContent) {
        rewardContent = { message: formData.rewardContent };
      } else if (formData.rewardType === 'enigma' && formData.rewardContent) {
        rewardContent = { enigma: formData.rewardContent };
      } else if (formData.rewardType === 'fake' && formData.rewardContent) {
        rewardContent = { fakeMessage: formData.rewardContent };
      }

      // Insert QR code
      const { error: insertError } = await supabase
        .from('qr_buzz_codes')
        .insert({
          code: newCode,
          location_name: formData.locationName,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          reward_type: formData.rewardType,
          reward_content: rewardContent,
          expires_at: formData.expiresAt || null,
          created_by: 'wikus77@hotmail.it'
        });

      if (insertError) throw insertError;

      toast.success(`QR Code ${newCode} creato con successo!`);
      
      // Reset form
      setFormData({
        locationName: '',
        lat: '',
        lng: '',
        rewardType: 'buzz',
        rewardContent: '',
        expiresAt: ''
      });

      // Reload data
      loadQRCodes();
      loadStats();

      // Show QR code for printing with reward message
      showQRForPrinting(newCode, formData);

    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error('Errore nella creazione del QR code');
    } finally {
      setIsCreating(false);
    }
  };

  // 🔥 FIXED: Advanced QR Generation with M1 Logo and Reward Message
  const generatePrintableQR = async (code: string, rewardMessage: string) => {
    // 🎯 CRITICAL FIX: QR points to validation endpoint with token
    const qrUrl = `https://m1ssion.eu/qr/validate?token=${code}`;
    
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
    // 🔥 FIXED: Generate reward message based on type
    let rewardMessage = 'REWARD CLASIFICATO';
    
    switch (formData.rewardType) {
      case 'buzz':
        rewardMessage = '⚡ BUZZ GRATUITO';
        break;
      case 'clue':
        rewardMessage = '🔍 INDIZIO SEGRETO';
        break;
      case 'enigma':
        rewardMessage = '🧩 ENIGMA MISTERIOSO';
        break;
      case 'fake':
        rewardMessage = '🌀 SORPRESA SPECIALE';
        break;
    }
    
    // 🔥 USE NEW ADVANCED QR GENERATION WITH REWARD MESSAGE
    generatePrintableQR(code, rewardMessage);
  };

  const deactivateQR = async (id: string, code: string) => {
    try {
      const { error } = await supabase
        .from('qr_buzz_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success(`QR Code ${code} disattivato`);
      loadQRCodes();
      loadStats();
    } catch (error) {
      console.error('Error deactivating QR:', error);
      toast.error('Errore nella disattivazione');
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'buzz': return '⚡';
      case 'clue': return '🔍';
      case 'enigma': return '🧩';
      case 'fake': return '🌀';
      default: return '❓';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'buzz': return 'bg-green-100 text-green-800';
      case 'clue': return 'bg-blue-100 text-blue-800';
      case 'enigma': return 'bg-purple-100 text-purple-800';
      case 'fake': return 'bg-orange-100 text-orange-800';
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
                <SelectContent>
                  <SelectItem value="buzz">⚡ Buzz Gratuito</SelectItem>
                  <SelectItem value="clue">🔍 Indizio</SelectItem>
                  <SelectItem value="enigma">🧩 Enigma</SelectItem>
                  <SelectItem value="fake">🌀 Depistaggio</SelectItem>
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
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                placeholder="52.520008 (Berlin)"
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
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                placeholder="13.404954 (Berlin)"
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

          {(formData.rewardType === 'clue' || formData.rewardType === 'enigma' || formData.rewardType === 'fake') && (
            <div>
              <Label htmlFor="rewardContent">
                {formData.rewardType === 'clue' && 'Testo Indizio'}
                {formData.rewardType === 'enigma' && 'Testo Enigma'}
                {formData.rewardType === 'fake' && 'Messaggio Depistaggio'}
              </Label>
              <Textarea
                id="rewardContent"
                value={formData.rewardContent}
                onChange={(e) => setFormData({ ...formData, rewardContent: e.target.value })}
                placeholder={
                  formData.rewardType === 'clue' ? 'Inserisci il testo dell\'indizio...' :
                  formData.rewardType === 'enigma' ? 'Inserisci il testo dell\'enigma...' :
                  'Inserisci il messaggio di depistaggio...'
                }
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
                      <span className="font-mono font-bold text-lg">{qr.code}</span>
                      <Badge className={getRewardColor(qr.reward_type)}>
                        {getRewardIcon(qr.reward_type)} {qr.reward_type.toUpperCase()}
                      </Badge>
                      {qr.is_used ? (
                        <Badge variant="secondary">USATO</Badge>
                      ) : (
                        <Badge variant="default">ATTIVO</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {qr.location_name} ({qr.lat.toFixed(6)}, {qr.lng.toFixed(6)})
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
                      {qr.used_at && (
                        <div className="text-green-600 mt-1">
                          Riscattato: {new Date(qr.used_at).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showQRForPrinting(qr.code, qr.location_name)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    {!qr.is_used && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateQR(qr.id, qr.code)}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    )}
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