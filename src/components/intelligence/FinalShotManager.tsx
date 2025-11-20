// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinalShotResult {
  success: boolean;
  is_winner: boolean;
  distance_meters: number;
  direction: string;
  attempt_number: number;
  max_attempts: number;
  target_coordinates?: { lat: number; lng: number };
  error?: string;
}

interface FinalShotAttempt {
  id: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  feedback_distance: number;
  feedback_direction: string;
  attempt_number: number;
  is_winner: boolean;
  created_at: string;
}

const FinalShotManager: React.FC = () => {
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState<FinalShotAttempt[]>([]);
  const [lastResult, setLastResult] = useState<FinalShotResult | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock mission ID - in real app would come from context
  const currentMissionId = 'mock-mission-id';

  useEffect(() => {
    loadAttempts();
    const interval = setInterval(() => {
      if (cooldownEnd && new Date() > cooldownEnd) {
        setCooldownEnd(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('final_shots')
        .select('*')
        .eq('mission_id', currentMissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAttempts(data || []);
      
      // Set cooldown if last attempt was recent
      if (data && data.length > 0) {
        const lastAttempt = new Date(data[0].created_at);
        const cooldown = new Date(lastAttempt.getTime() + 12 * 60 * 60 * 1000); // 12 hours
        if (cooldown > new Date()) {
          setCooldownEnd(cooldown);
        }
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFinalShot = async () => {
    if (!coordinates.lat || !coordinates.lng) {
      toast({
        title: "Errore",
        description: "Inserisci entrambe le coordinate",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('submit_final_shot', {
        p_mission_id: currentMissionId,
        p_latitude: parseFloat(coordinates.lat),
        p_longitude: parseFloat(coordinates.lng)
      });

      if (error) throw error;

      const result = data as unknown as FinalShotResult;
      setLastResult(result);

      if (result.error) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      if (result.is_winner) {
        toast({
          title: "🎯 VINCITORE!",
          description: "Complimenti! Hai trovato il premio!",
          variant: "default"
        });
      } else {
        toast({
          title: "Final Shot Registrato",
          description: `Distanza: ${(result.distance_meters / 1000).toFixed(2)} km | Direzione: ${result.direction}`,
          variant: "default"
        });
      }

      // Set cooldown
      setCooldownEnd(new Date(Date.now() + 12 * 60 * 60 * 1000));
      
      // Reload attempts
      await loadAttempts();
      
      // Clear form
      setCoordinates({ lat: '', lng: '' });

    } catch (error) {
      console.error('Error submitting final shot:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'invio del Final Shot",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCooldownTime = () => {
    if (!cooldownEnd) return null;
    const now = new Date();
    const diff = cooldownEnd.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getRemainingAttempts = () => {
    const maxAttempts = 3;
    return Math.max(0, maxAttempts - attempts.length);
  };

  const getResultMessage = (result: FinalShotResult, attempt: FinalShotAttempt) => {
    if (result.is_winner) {
      return {
        title: "🎯 Complimenti! Hai trovato il premio.",
        subtitle: `📍 Coordinate corrette: ${result.target_coordinates?.lat.toFixed(6)}, ${result.target_coordinates?.lng.toFixed(6)}`,
        details: `⏱ Sei stato il primo tra gli agenti attivi.`,
        variant: "success" as const
      };
    }

    const distanceKm = (result.distance_meters / 1000).toFixed(1);
    
    if (attempt.attempt_number === 1) {
      return {
        title: "❌ Coordinate non corrette.",
        subtitle: `Errore: ${distanceKm} km`,
        details: "📍 Direzione: riprova con più precisione",
        variant: "error" as const
      };
    } else {
      return {
        title: "❌ Coordinate non corrette.",
        subtitle: `Errore: ${distanceKm} km`,
        details: `📍 Direzione: ${result.direction}`,
        variant: "error" as const
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Final Shot</h3>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Coordinate finali per la cattura del premio</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{getRemainingAttempts()}</div>
              <div className="text-sm text-muted-foreground">Tentativi Rimasti</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {getCooldownTime() || "Pronto"}
              </div>
              <div className="text-sm text-muted-foreground">Cooldown</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{attempts.length}</div>
              <div className="text-sm text-muted-foreground">Shots Effettuati</div>
            </CardContent>
          </Card>
        </div>

        {/* Final Shot Form */}
        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
              Invia Final Shot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Latitudine Final Shot
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="46.0 [FINAL-LAT]"
                  value={coordinates.lat}
                  onChange={(e) => setCoordinates({...coordinates, lat: e.target.value})}
                  className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                  disabled={isSubmitting || getRemainingAttempts() === 0 || !!getCooldownTime()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Longitudine Final Shot
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="8.0 [FINAL-LNG]"
                  value={coordinates.lng}
                  onChange={(e) => setCoordinates({...coordinates, lng: e.target.value})}
                  className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                  disabled={isSubmitting || getRemainingAttempts() === 0 || !!getCooldownTime()}
                />
              </div>
            </div>

            {(getRemainingAttempts() === 0 || getCooldownTime()) && (
              <div className="text-center text-sm text-muted-foreground p-3 bg-muted/40 rounded-xl">
                {getRemainingAttempts() === 0 && "Hai esaurito tutti i tentativi disponibili"}
                {getCooldownTime() && `Prossimo tentativo disponibile tra: ${getCooldownTime()}`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ FINAL SHOT BUTTON - FUORI DALLA MAPPA - SEMPRE VISIBILE - FIX DEFINITIVO SAFARI iOS */}
      {coordinates.lat && coordinates.lng && (
        <div 
          className="w-full flex justify-center mt-4 px-4" 
          style={{ 
            position: 'relative',
            zIndex: 99999,
            display: 'block',
            marginBottom: '120px'
          }}
        >
          <Button
            onClick={submitFinalShot}
            disabled={isSubmitting || getRemainingAttempts() === 0 || !!getCooldownTime() || !coordinates.lat || !coordinates.lng}
            className="w-full max-w-md py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-2xl text-white border-4 border-red-300/50"
            style={{ 
              minHeight: '70px',
              display: 'flex',
              visibility: 'visible',
              opacity: 1,
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(220, 38, 38, 0.4)'
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                <span className="font-bold">Invio Final Shot...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Target className="w-6 h-6" />
                <span className="font-bold">🎯 INVIA FINAL SHOT</span>
              </div>
            )}
          </Button>
        </div>
      )}
      
      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Storico Final Shot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attempts.map((attempt, index) => {
                const result = {
                  is_winner: attempt.is_winner,
                  distance_meters: attempt.distance_meters,
                  direction: attempt.feedback_direction
                } as FinalShotResult;
                
                const message = getResultMessage(result, attempt);
                
                return (
                  <div
                    key={attempt.id}
                    className={`p-4 rounded-xl border-2 ${
                      attempt.is_winner 
                        ? 'border-green-400/50 bg-green-500/10' 
                        : 'border-red-400/50 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {attempt.is_winner ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="font-medium">
                            Tentativo #{attempt.attempt_number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(attempt.created_at).toLocaleDateString('it-IT')}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium mb-1">{message.title}</div>
                          <div className="text-muted-foreground mb-1">{message.subtitle}</div>
                          <div className="text-muted-foreground">{message.details}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{attempt.latitude.toFixed(6)}</div>
                        <div>{attempt.longitude.toFixed(6)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FinalShotManager;