// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// QR VALIDATION MODAL - Safari iOS Black Screen Fix
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, MapPin, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface QRValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode?: string;
}

interface QRData {
  id: string;
  code: string;
  lat: number;
  lng: number;
  location_name: string;
  reward_type: string;
  message: string;
  is_used: boolean;
}

export const QRValidationModal: React.FC<QRValidationModalProps> = ({
  isOpen,
  onClose,
  qrCode
}) => {
  const { user } = useUnifiedAuth();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && qrCode) {
      loadQRData();
    } else {
      resetState();
    }
  }, [isOpen, qrCode]);

  const resetState = () => {
    setQrData(null);
    setIsLoading(false);
    setIsRedeeming(false);
    setRedeemSuccess(false);
    setError(null);
  };

  const loadQRData = async () => {
    if (!qrCode) return;

    setIsLoading(true);
    setError(null);

    try {
      // First try qr_buzz_codes table
      let { data: qrBuzzData, error: buzzError } = await supabase
        .from('qr_buzz_codes')
        .select('*')
        .eq('code', qrCode.toUpperCase())
        .single();

      if (qrBuzzData) {
        setQrData({
          id: qrBuzzData.id,
          code: qrBuzzData.code,
          lat: qrBuzzData.lat,
          lng: qrBuzzData.lng,
          location_name: qrBuzzData.location_name,
          reward_type: qrBuzzData.reward_type,
          message: `Reward ${qrBuzzData.reward_type}`,
          is_used: qrBuzzData.is_used
        });
        return;
      }

      // Fallback to qr_rewards table  
      let { data: qrRewardData, error: rewardError } = await supabase
        .from('qr_rewards')
        .select('id, reward_type, location_name, message, lat, lon')
        .eq('id', qrCode.toUpperCase())
        .single();

      if (qrRewardData) {
        setQrData({
          id: qrRewardData.id,
          code: qrRewardData.id, // Use ID as code for qr_rewards
          lat: qrRewardData.lat || 0,
          lng: qrRewardData.lon || 0, // Note: lon not lng in qr_rewards
          location_name: qrRewardData.location_name || 'Posizione QR',
          reward_type: qrRewardData.reward_type,
          message: qrRewardData.message || `Reward ${qrRewardData.reward_type}`,
          is_used: false
        });
        return;
      }

      // Final fallback to qr_codes table
      const { data: qc } = await supabase
        .from('qr_codes')
        .select('code, title, reward_type, reward_value, lat, lng, is_active')
        .eq('code', qrCode.toUpperCase())
        .maybeSingle();

      if (qc) {
        setQrData({
          id: qc.code,
          code: qc.code,
          lat: qc.lat || 0,
          lng: qc.lng || 0,
          location_name: qc.title || 'Posizione QR',
          reward_type: qc.reward_type,
          message: `Reward ${qc.reward_type}`,
          is_used: false // Lasciamo a redeem il controllo dei doppioni
        });
        return;
      }

      // QR code not found
      setError('QR code non trovato o non valido');

    } catch (err) {
      console.error('Error loading QR data:', err);
      setError('Errore nel caricamento dei dati QR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!qrData || !user) return;

    setIsRedeeming(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-qr', {
        body: {
          code: qrData.code.toUpperCase()
        }
      });

      if (error) {
        // Extract detailed error from Supabase Functions context
        const detail = (error as any)?.context?.error || error.message;
        throw new Error(detail);
      }

      const status = data?.status;
      if (status === 'ok') {
        setRedeemSuccess(true);
        toast.success('🎁 Ricompensa sbloccata!');
        
        // Navigate based on reward type
        setTimeout(() => {
          onClose();
          if (data?.reward_type === 'buzz_credit') {
            window.location.href = '/buzz?free=1&reward=1';
          } else if (data?.reward_type === 'buzz_map_credit') {
            window.location.href = '/map?free=1&reward=1';
          } else {
            window.location.href = '/home';
          }
        }, 2000);
        
      } else if (status === 'already_redeemed' || status === 'already_claimed') {
        toast.info('Hai già riscattato questo QR');
        setTimeout(() => {
          onClose();
          window.location.href = '/home';
        }, 2000);
      } else if (data?.error === 'invalid_or_inactive_code') {
        setError('Codice QR non valido o disattivato');
      } else {
        setError('Riscatto QR non riuscito');
      }

    } catch (err: any) {
      console.error('QR redemption error:', err);
      setError(err.message || 'Errore nel riscatto del QR code');
      toast.error(`Redeem fallito: ${err.message}`);
    } finally {
      setIsRedeeming(false);
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'buzz': return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'clue': return <MapPin className="w-6 h-6 text-blue-500" />;
      case 'enigma': return <Gift className="w-6 h-6 text-purple-500" />;
      case 'sorpresa_speciale': return <Gift className="w-6 h-6 text-pink-500" />;
      default: return <Gift className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            🎯 M1SSION™ QR Validation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Caricamento QR code...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadQRData} 
                  className="mt-3"
                  size="sm"
                >
                  Riprova
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {redeemSuccess && (
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-green-500 mb-1">Riscattato!</h3>
                <p className="text-sm">QR code riscattato con successo</p>
              </CardContent>
            </Card>
          )}

          {/* QR Data Display */}
          {qrData && !redeemSuccess && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  {getRewardIcon(qrData.reward_type)}
                  <h3 className="font-bold mt-2">{qrData.location_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Codice: {qrData.code}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tipo Reward:</span>
                    <span className="font-medium capitalize">{qrData.reward_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stato:</span>
                    <span className={qrData.is_used ? 'text-red-500' : 'text-green-500'}>
                      {qrData.is_used ? 'Già utilizzato' : 'Disponibile'}
                    </span>
                  </div>
                </div>

                {qrData.message && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{qrData.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {qrData && !redeemSuccess && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Chiudi
              </Button>
              
              {!qrData.is_used && (
                <Button 
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                  className="flex-1"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Riscattando...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Riscatta
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Just close button for success/error states */}
          {(redeemSuccess || error) && qrData && (
            <Button onClick={onClose} className="w-full">
              Chiudi
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};