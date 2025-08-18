// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QrCode, Eye, AlertTriangle } from 'lucide-react';

interface QRTestData {
  id: string;
  reward_type: string;
  location_name: string;
  lat: number;
  lon: number;
  attivo: boolean;
  scansioni: number;
  message: string;
  created_at: string;
}

export const QRTestPage = () => {
  const [qrCodes, setQrCodes] = useState<QRTestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_rewards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setQrCodes(data || []);
      toast.success(`✅ Caricati ${data?.length || 0} QR codes`);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast.error('Errore nel caricamento dei QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const testQRValidation = (qrId: string) => {
    // Generate test URLs for both formats
    const shortCode = qrId.replace(/-/g, '').toUpperCase().substring(0, 8);
    const urlFormat1 = `https://m1ssion.eu/qr/validate?token=${qrId}`;
    const urlFormat2 = `https://m1ssion.eu/qr/validate?token=${shortCode}`;
    const urlFormat3 = `https://m1ssion.eu/qr/${qrId}`;
    const urlFormat4 = `https://m1ssion.eu/qr/${shortCode}`;
    
    // Open in new tabs for testing
    window.open(urlFormat1, '_blank');
    window.open(urlFormat2, '_blank');
    window.open(urlFormat3, '_blank');
    window.open(urlFormat4, '_blank');
    
    toast.success(`🔬 Test URLs generati per QR ${shortCode}`);
  };

  const generateTestQRCode = () => {
    const qrUrl = `https://m1ssion.eu/qr/validate?token=ebc74763-2a38-44ad-895a-b9c0901a6877`;
    window.open(qrUrl, '_blank');
    toast.success('🔗 Test QR aperto');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-primary" />
              🔬 M1SSION™ QR System Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={loadQRCodes} variant="outline">
                🔄 Ricarica QR Codes
              </Button>
              <Button onClick={generateTestQRCode}>
                🧪 Test QR Validation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Sistema Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{qrCodes.filter(qr => qr.attivo).length}</div>
                <div className="text-sm text-muted-foreground">QR Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{qrCodes.filter(qr => qr.scansioni > 0).length}</div>
                <div className="text-sm text-muted-foreground">QR Scansionati</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{qrCodes.length}</div>
                <div className="text-sm text-muted-foreground">Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">✅</div>
                <div className="text-sm text-muted-foreground">Firebase OK</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes List */}
        <Card>
          <CardHeader>
            <CardTitle>🗂️ QR Codes Database ({qrCodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">⏳ Caricamento...</div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                ❌ Nessun QR code trovato nel database
              </div>
            ) : (
              <div className="space-y-3">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {qr.id}
                        </span>
                        <span className="text-sm font-medium">
                          {qr.reward_type.toUpperCase()}
                        </span>
                        {qr.attivo ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ATTIVO</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">DISATTIVO</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => testQRValidation(qr.id)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Test
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>📍 <strong>Posizione:</strong> {qr.location_name}</div>
                      <div>🌍 <strong>Coordinate:</strong> {qr.lat.toFixed(6)}, {qr.lon.toFixed(6)}</div>
                      <div>💬 <strong>Messaggio:</strong> {qr.message}</div>
                      <div>📊 <strong>Scansioni:</strong> {qr.scansioni}</div>
                      <div>⏰ <strong>Creato:</strong> {new Date(qr.created_at).toLocaleString('it-IT')}</div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-muted rounded text-xs font-mono space-y-1">
                      <div>🔗 URL1: https://m1ssion.eu/qr/validate?token={qr.id}</div>
                      <div>🔗 URL2: https://m1ssion.eu/qr/{qr.id}</div>
                      <div>🔗 SHORT: https://m1ssion.eu/qr/{qr.id.replace(/-/g, '').substring(0, 8)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
              <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">✅ Come testare:</h4>
              <ol className="list-decimal pl-4 space-y-1 text-blue-700 dark:text-blue-300">
                <li>Clicca "Test" su un QR code per aprire le URL di test</li>
                <li>Verifica che le pagine si aprano correttamente su Safari iOS</li>
                <li>Controlla che i reward vengano mostrati</li>
                <li>Testa sia il formato UUID completo che il codice corto</li>
              </ol>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
              <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">🎯 Sistema Funzionante se:</h4>
              <ul className="list-disc pl-4 space-y-1 text-green-700 dark:text-green-300">
                <li>Tutte le URL si aprono senza errori 404</li>
                <li>I reward vengono visualizzati correttamente</li>
                <li>Il routing Firebase funziona su m1ssion.eu</li>
                <li>Safari iOS mostra le pagine senza schermo nero</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};