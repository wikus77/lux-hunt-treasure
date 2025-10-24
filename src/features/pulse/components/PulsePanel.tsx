/**
 * THE PULSE™ — Pulse Panel (Modal/Sheet)
 * Pannello dettaglio con info, micro-feed, thresholds log, ottimizzato per mobile
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { supabase } from '@/integrations/supabase/client';
import { Zap, TrendingUp, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PulsePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ThresholdLog {
  id: string;
  threshold: number;
  value_snapshot: number;
  reached_at: string;
}

export const PulsePanel = ({ open, onOpenChange }: PulsePanelProps) => {
  const { pulseState, lastUpdate } = usePulseRealtime();
  const [thresholdLogs, setThresholdLogs] = useState<ThresholdLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const value = pulseState?.value ?? 0;
  
  // Map value to animation intensity (identical to PulseBar)
  const flowSpeed = value < 25 ? '6s' : value < 50 ? '5s' : value < 75 ? '4s' : '3s';
  const glowScale = value < 25 ? '1.00' : value < 50 ? '1.01' : value < 75 ? '1.02' : '1.03';
  const glowIntensity = value > 80 ? 1 : value > 50 ? 0.8 : value > 25 ? 0.6 : 0.4;

  // Check accessibility preference
  useEffect(() => {
    const prefersReducedMotion = localStorage.getItem('pulse_reduce_motion') === 'true';
    setReduceMotion(prefersReducedMotion);
  }, []);

  // Fetch threshold logs
  useEffect(() => {
    if (!open) return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const { data, error } = await supabase
          .from('pulse_thresholds_log')
          .select('*')
          .order('reached_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setThresholdLogs(data || []);
      } catch (err) {
        console.error('❌ Error fetching threshold logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] max-h-[800px] rounded-t-3xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header */}
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-2xl">The PULSE™</SheetTitle>
                  <SheetDescription className="text-base">
                    L'energia collettiva della community M1SSION™
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Current Value */}
            <motion.div
              className="living-hud-glass p-6 rounded-2xl space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  Livello Globale
                </span>
                <span className="text-4xl font-mono font-bold text-primary tabular-nums">
                  {Math.round(value)}%
                </span>
              </div>

              {/* Energy Bar - IDENTICAL to Main PulseBar */}
              <div className="relative h-[14px] rounded-full overflow-hidden shadow-[0_0_25px_rgba(0,231,255,0.5)]">
                <div 
                  className={reduceMotion ? '' : 'animate-energyFlow'}
                  style={{ 
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(270deg, #ff4df0, #00eaff, #e0ffff, #00eaff, #ff4df0)',
                    backgroundSize: '300% 300%',
                    ['--flow-speed' as any]: flowSpeed
                  }} 
                />
                <motion.div 
                  className={reduceMotion ? '' : 'animate-pulseGlow'}
                  style={{ 
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 75%)',
                    opacity: glowIntensity,
                    filter: value > 80 ? 'drop-shadow(0 0 10px rgba(255,0,255,0.8))' : 'none',
                    ['--glow-scale' as any]: glowScale
                  }}
                />
                <div 
                  className={`absolute -inset-1 blur-md -z-10 ${reduceMotion ? '' : 'animate-energyFlow'}`}
                  style={{ 
                    background: 'linear-gradient(270deg, rgba(255,77,240,0.3), rgba(0,234,255,0.3), rgba(255,77,240,0.3))',
                    backgroundSize: '300% 300%',
                    ['--flow-speed' as any]: flowSpeed
                  }} 
                />
              </div>

              {/* Last update */}
              {lastUpdate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Ultimo aggiornamento: {lastUpdate.delta > 0 ? '+' : ''}
                    {lastUpdate.delta.toFixed(2)}%
                  </span>
                </div>
              )}
            </motion.div>

            {/* What is The Pulse */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Cos'è The PULSE™?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The PULSE™ è il battito collettivo della community M1SSION™. Ogni azione degli
                agenti contribuisce all'energia globale: completare BUZZ, scoprire portali,
                interagire con Norah AI. Quando il Pulse raggiunge soglie chiave (25%, 50%, 75%,
                100%), vengono sbloccati eventi speciali per tutta la community.
              </p>
            </div>

            <Separator />

            {/* Threshold Logs */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Ultime Soglie Raggiunte
              </h3>

              {loadingLogs ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Caricamento...
                </div>
              ) : thresholdLogs.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nessuna soglia raggiunta ancora. Contribuisci con le tue azioni!
                </div>
              ) : (
                <div className="space-y-2">
                  {thresholdLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            log.threshold === 100
                              ? 'bg-primary text-primary-foreground'
                              : log.threshold === 75
                              ? 'bg-orange-500/20 text-orange-500'
                              : log.threshold === 50
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-green-500/20 text-green-500'
                          }`}
                        >
                          {log.threshold}%
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Soglia {log.threshold}% raggiunta
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.reached_at), "d MMM 'alle' HH:mm", {
                              locale: it,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        {log.value_snapshot.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
