// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Gift, AlertTriangle, Zap } from 'lucide-react';

interface QRRedemptionResult {
  success: boolean;
  message: string;
  reward?: {
    type: string;
    value?: number;
    content?: any;
    message?: string;
  };
  location?: string;
  distance?: number;
  error?: string;
  maxDistance?: number;
}

export const QRRedeemPage = () => {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [, setLocation] = useLocation();
  const { user } = useAuthContext();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [result, setResult] = useState<QRRedemptionResult | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Devi essere loggato per riscattare un QR code');
      setLocation('/auth');
      return;
    }

    if (code) {
      getUserLocationAndRedeem();
    }
  }, [code, user]);

  const getUserLocationAndRedeem = () => {
    if (navigator.geolocation) {
      setIsRedeeming(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          console.log('QR_REDEEM • geo position', pos);
          redeemQRCode(pos);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Try redeem without location
          redeemQRCode();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Try redeem without location
      redeemQRCode();
    }
  };

  const redeemQRCode = async (position?: { lat: number; lng: number }) => {
    if (!code || !user) return;

    try {
      setIsRedeeming(true);
      console.log('QR_REDEEM • request', {
        code: code.toUpperCase(),
        userLat: position?.lat,
        userLng: position?.lng,
      });
      const { data, error } = await supabase.functions.invoke('qr-redeem', {
        body: {
          code: code.toUpperCase(),
          userLat: position?.lat,
          userLng: position?.lng,
        },
      });
      console.log('QR_REDEEM • response', { data, error });

      if (error) throw error;

      setResult(data);

      if (data.success) {
        toast.success(data.message);
        
        // Show specific reward notifications
        if (data.reward?.type === 'buzz') {
          toast.success('🎯 Buzz gratuito aggiunto al tuo account!');
        }
      } else {
        toast.error(data.error || 'Errore nel riscatto del QR code');
      }

    } catch (error) {
      console.error('QR redemption error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setResult({
        success: false,
        message: '',
        error: errorMessage
      });
      toast.error('Errore nel riscatto del QR code');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleReturnToMap = () => {
    setLocation('/map');
  };

  const handleReturnHome = () => {
    setLocation('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Accesso Richiesto</h2>
            <p className="text-muted-foreground mb-4">
              Devi essere loggato per riscattare i QR code
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {isRedeeming ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Riscattando QR Code...</h2>
              <p className="text-muted-foreground">
                Codice: <span className="font-mono font-bold">{code}</span>
              </p>
              {userPosition && (
                <p className="text-sm text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Verificando posizione...
                </p>
              )}
            </div>
          ) : result ? (
            <div className="text-center">
              {result.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    {result.reward?.type === 'buzz' && <Zap className="w-8 h-8 text-green-600" />}
                    {result.reward?.type === 'clue' && <Gift className="w-8 h-8 text-blue-600" />}
                    {result.reward?.type === 'enigma' && <Gift className="w-8 h-8 text-purple-600" />}
                    {result.reward?.type === 'fake' && <AlertTriangle className="w-8 h-8 text-orange-600" />}
                    {!result.reward?.type && <Gift className="w-8 h-8 text-green-600" />}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 text-green-600">
                    Riscatto Completato!
                  </h2>
                  
                  <p className="text-base mb-4 whitespace-pre-line">
                    {result.message}
                  </p>

                  {result.location && (
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <p className="text-sm">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        <strong>Posizione:</strong> {result.location}
                      </p>
                      {result.distance !== undefined && (
                        <p className="text-sm mt-1">
                          <Clock className="w-4 h-4 inline mr-1" />
                          <strong>Distanza:</strong> {result.distance}m
                        </p>
                      )}
                    </div>
                  )}

                  {result.reward?.type === 'clue' && result.reward.content && (
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                        🔍 Indizio Segreto
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {result.reward.content.message || result.reward.content}
                      </p>
                    </div>
                  )}

                  {result.reward?.type === 'enigma' && result.reward.content && (
                    <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                        🧩 Enigma Misterioso
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {result.reward.content.enigma || result.reward.content}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 text-red-600">
                    Riscatto Fallito
                  </h2>
                  
                  <p className="text-base mb-4">
                    {result.error || 'Errore sconosciuto'}
                  </p>

                  {result.distance && result.maxDistance && (
                    <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Sei a {result.distance}m di distanza.
                        <br />
                        Devi essere entro {result.maxDistance}m dal QR code.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Button onClick={handleReturnToMap} className="w-full">
                  Torna alla Mappa
                </Button>
                <Button onClick={handleReturnHome} variant="outline" className="w-full">
                  Torna a Casa
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">QR Code Non Valido</h2>
              <p className="text-muted-foreground mb-4">
                Il QR code non è stato riconosciuto o è scaduto.
              </p>
              <Button onClick={handleReturnToMap} className="w-full">
                Torna alla Mappa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};