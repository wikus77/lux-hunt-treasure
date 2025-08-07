// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Gift, AlertTriangle, Zap } from 'lucide-react';

interface QRValidationResult {
  success: boolean;
  message: string;
  reward?: {
    type: string;
    message?: string;
  };
  location?: string;
  distance?: number;
  error?: string;
  maxDistance?: number;
}

export const QRValidatePage = () => {
  const [, setLocation] = useLocation();
  const { user } = useUnifiedAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<QRValidationResult | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Devi essere loggato per riscattare un QR code');
      setLocation('/auth');
      return;
    }

      // 🔥 CRITICAL iOS SAFARI FIX: Enhanced token extraction with debugging
      console.log('🔍 QR VALIDATION DEBUG:', {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        userAgent: navigator.userAgent
      });

      const urlParams = new URLSearchParams(window.location.search);
      let token = urlParams.get('token');
      
      // If no token in params, try to extract from path (for /qr/:code routes)
      if (!token) {
        const pathParts = window.location.pathname.split('/');
        console.log('🔍 PATH PARTS:', pathParts);
        if (pathParts.length >= 3 && pathParts[1] === 'qr' && pathParts[2] !== 'validate' && pathParts[2] !== 'scanner' && pathParts[2] !== 'test') {
          token = pathParts[2];
        }
      }
      
      // Clean token from any URL encoding or special characters
      if (token) {
        token = decodeURIComponent(token).trim().replace(/[\n\r\t]/g, '');
      }

      console.log('🔥 EXTRACTED TOKEN:', token);

    if (token && token.trim()) {
      console.log('✅ TOKEN FOUND, validating:', token.trim());
      getUserLocationAndValidate(token.trim());
    } else {
      console.error('❌ NO TOKEN FOUND - URL DEBUG:', {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search
      });
      setResult({
        success: false,
        message: 'URL non contiene token QR valido',
        error: `Token QR non trovato nell'URL: ${window.location.href}`
      });
    }
  }, [user]);

  const getUserLocationAndValidate = (token: string) => {
    if (navigator.geolocation) {
      setIsValidating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          validateQRToken(token, pos);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Try validation without location
          validateQRToken(token);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Try validation without location
      validateQRToken(token);
    }
  };

  const validateQRToken = async (token: string, position?: { lat: number; lng: number }) => {
    if (!token || !user) return;

    try {
      setIsValidating(true);
      
      // 🔥 NEW: Query qr_rewards table - try exact token first, then fallback to code search
      let qrData = null;
      let qrError = null;
      
      // First try: exact UUID match
      const { data: exactMatch, error: exactError } = await supabase
        .from('qr_rewards')
        .select('*')
        .eq('id', token)
        .eq('attivo', true)
        .maybeSingle();
      
      if (exactMatch) {
        qrData = exactMatch;
      } else {
        // Second try: search for QR where the token might be the short code
        const { data: codeMatch, error: codeError } = await supabase
          .from('qr_rewards')
          .select('*')
          .eq('attivo', true)
          .limit(50);
        
        if (codeMatch) {
          // Look for a match where the UUID contains the token (for short codes)
          qrData = codeMatch.find(qr => qr.id.replace(/-/g, '').toUpperCase().includes(token.toUpperCase()));
        }
        
        qrError = exactError || codeError;
      }

      if (qrError) {
        console.error('QR validation error:', qrError);
        setResult({
          success: false,
          message: '',
          error: 'Errore nella validazione del QR Code'
        });
        toast.error('Errore nel sistema QR');
        return;
      }

      if (!qrData) {
        setResult({
          success: false,
          message: '',
          error: 'QR Code non valido o scaduto'
        });
        toast.error('QR Code non trovato');
        return;
      }

      // Check if already redeemed by this user
      if (qrData.redeemed_by && qrData.redeemed_by.includes(user.id)) {
        setResult({
          success: false,
          message: '',
          error: 'QR Code già riscattato da te'
        });
        toast.error('QR Code già utilizzato');
        return;
      }

      // Check distance if location is available
      if (position) {
        const distance = calculateDistance(
          position.lat,
          position.lng,
          qrData.lat,
          qrData.lon
        );

        if (distance > qrData.max_distance_meters) {
          setResult({
            success: false,
            message: '',
            error: `Devi essere più vicino al QR code. Distanza: ${distance}m`,
            distance: Math.round(distance),
            maxDistance: qrData.max_distance_meters
          });
          toast.error('Troppo lontano dal QR code!');
          return;
        }
      }

      // Process reward based on type
      let rewardMessage = '';
      switch (qrData.reward_type) {
        case 'buzz_gratis':
          rewardMessage = '⚡ Buzz gratuito aggiunto al tuo account!';
          break;
        case 'indizio_segreto':
          rewardMessage = `🔍 Indizio segreto: ${qrData.message}`;
          break;
        case 'enigma_misterioso':
          rewardMessage = `🧩 Enigma: ${qrData.message}`;
          break;
        case 'sorpresa_speciale':
          rewardMessage = `🌀 Sorpresa: ${qrData.message}`;
          break;
        default:
          rewardMessage = qrData.message;
      }

      // Update QR record
      const { error: updateError } = await supabase
        .from('qr_rewards')
        .update({
          scansioni: qrData.scansioni + 1,
          redeemed_by: [...(qrData.redeemed_by || []), user.id],
          updated_at: new Date().toISOString()
        })
        .eq('id', token);

      if (updateError) throw updateError;

      setResult({
        success: true,
        message: rewardMessage,
        reward: {
          type: qrData.reward_type,
          message: qrData.message
        },
        location: qrData.location_name,
        distance: position ? Math.round(calculateDistance(
          position.lat,
          position.lng,
          qrData.lat,
          qrData.lon
        )) : undefined
      });

      toast.success('QR Code riscattato con successo!');

    } catch (error) {
      console.error('QR validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setResult({
        success: false,
        message: '',
        error: errorMessage
      });
      toast.error('Errore nel riscatto del QR code');
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
          {isValidating ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Validando QR Code...</h2>
              <p className="text-muted-foreground">
                Verificando token e posizione...
              </p>
              {userPosition && (
                <p className="text-sm text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Posizione acquisita
                </p>
              )}
            </div>
          ) : result ? (
            <div className="text-center">
              {result.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    {result.reward?.type === 'buzz_gratis' && <Zap className="w-8 h-8 text-green-600" />}
                    {result.reward?.type === 'indizio_segreto' && <Gift className="w-8 h-8 text-blue-600" />}
                    {result.reward?.type === 'enigma_misterioso' && <Gift className="w-8 h-8 text-purple-600" />}
                    {result.reward?.type === 'sorpresa_speciale' && <Gift className="w-8 h-8 text-orange-600" />}
                    {!result.reward?.type && <Gift className="w-8 h-8 text-green-600" />}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 text-green-600">
                    🎯 M1SSION™ Reward Unlocked!
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

                  {result.reward?.type === 'indizio_segreto' && (
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                        🔍 Indizio Segreto M1SSION™
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {result.reward.message}
                      </p>
                    </div>
                  )}

                  {result.reward?.type === 'enigma_misterioso' && (
                    <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                        🧩 Enigma Misterioso
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {result.reward.message}
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
                    ❌ Validazione Fallita
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