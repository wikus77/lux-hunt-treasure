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
    if (!formData.locationName || !formData.lat || !formData.lng) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

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

      // Show QR code for printing
      showQRForPrinting(newCode, formData.locationName);

    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error('Errore nella creazione del QR code');
    } finally {
      setIsCreating(false);
    }
  };

  const showQRForPrinting = (code: string, location: string) => {
    const qrUrl = `https://m1ssion.com/qr/${code}`;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${code}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                color: white;
              }
              .qr-container {
                background: white;
                padding: 20px;
                border-radius: 15px;
                display: inline-block;
                margin: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              }
              .qr-title {
                color: #000;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .qr-subtitle {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
              }
              .qr-location {
                color: #333;
                font-size: 12px;
                margin-top: 10px;
              }
              .qr-code {
                font-family: monospace;
                font-weight: bold;
                color: #333;
                margin-top: 5px;
              }
              .secret-warning {
                color: #ff4444;
                font-size: 11px;
                margin-top: 10px;
                font-weight: bold;
              }
              @media print {
                body { background: white !important; color: black !important; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">🎯 M1SSION™</div>
              <div class="qr-subtitle">TOP SECRET QR CODE</div>
              <div id="qrcode"></div>
              <div class="qr-location">${location}</div>
              <div class="qr-code">${code}</div>
              <div class="secret-warning">⚠️ REWARD CLASSIFICATO</div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            <script>
              QRCode.toCanvas(document.getElementById('qrcode'), '${qrUrl}', {
                width: 200,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
              }, function (error) {
                if (error) console.error(error);
                else setTimeout(() => window.print(), 1000);
              });
            </script>
          </body>
        </html>
      `);
    }
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
              <Label htmlFor="lat">Latitudine *</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                placeholder="52.520008"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitudine *</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                placeholder="13.404954"
              />
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