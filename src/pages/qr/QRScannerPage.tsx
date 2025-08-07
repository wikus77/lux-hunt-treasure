// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';
import { QrCode, Camera, Type, Zap, AlertTriangle } from 'lucide-react';

export const QRScannerPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useUnifiedAuth();
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Devi essere loggato per scannerizzare QR codes');
      setLocation('/auth');
    }
  }, [user]);

  const handleManualCodeSubmit = () => {
    if (!manualCode.trim()) {
      toast.error('Inserisci un codice valido');
      return;
    }

    // Redirect to validation page with token
    const currentDomain = window.location.origin;
    const validationUrl = `${currentDomain}/qr/validate?token=${manualCode.trim().toUpperCase()}`;
    window.location.href = validationUrl;
  };

  const startCamera = async () => {
    try {
      setIsProcessing(true);
      
      // Check if we're on mobile and can access camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera non disponibile su questo dispositivo');
        return;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera for QR scanning
        } 
      });

      // For now, redirect to a simple URL input since camera QR scanning requires additional libraries
      toast.info('Per ora usa il campo manuale. Scanner camera in arrivo!');
      
      // Stop the stream since we're not using it yet
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Impossibile accedere alla camera. Usa il campo manuale.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Accesso Richiesto</h2>
            <p className="text-muted-foreground mb-4">
              Devi essere loggato per scannerizzare QR codes
            </p>
            <Button onClick={() => setLocation('/auth')} className="w-full">
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Scanner QR M1SSION™</h1>
          <p className="text-muted-foreground">
            Scansiona i QR codes per ottenere rewards esclusivi
          </p>
        </div>

        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scanner Camera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Scanner camera QR in sviluppo
                </p>
                <Button 
                  onClick={startCamera}
                  disabled={isProcessing}
                  variant="outline"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Avvia Camera
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Inserimento Manuale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manual-code">Codice QR</Label>
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="es. ABC12345"
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Inserisci il codice QR che hai trovato
              </p>
            </div>

            <Button 
              onClick={handleManualCodeSubmit}
              className="w-full"
              disabled={!manualCode.trim()}
            >
              <Zap className="w-4 h-4 mr-2" />
              Riscatta Reward
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Come funziona:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Trova un QR code M1SSION™ in giro per la città</li>
              <li>2. Scansiona con la camera o inserisci il codice manualmente</li>
              <li>3. Assicurati di essere vicino alla posizione del QR</li>
              <li>4. Riscatta il tuo reward esclusivo!</li>
            </ol>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => setLocation('/map')} 
          className="w-full"
        >
          Torna alla Mappa
        </Button>
      </div>
    </div>
  );
};