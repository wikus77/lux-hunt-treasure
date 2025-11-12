// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { useBattleSystem } from '@/hooks/useBattleSystem';
import { useBattleRealtimeSubscription } from '@/hooks/useBattleRealtimeSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Shield, Swords, Clock } from 'lucide-react';

interface BattleHUDProps {
  sessionId: string | null;
  onClose?: () => void;
}

export function BattleHUD({ sessionId, onClose }: BattleHUDProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDefense, setSelectedDefense] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitDefense, defenseCatalog, loading: catalogLoading } = useBattleSystem();
  const { state } = useBattleRealtimeSubscription(sessionId);

  // Update countdown timer
  useEffect(() => {
    if (!state.until || state.status !== 'await_defense') {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, state.until! - Date.now());
      setTimeLeft(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        console.debug('[Battle HUD] Timer expired');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [state.until, state.status]);

  const handleDefend = async () => {
    if (!sessionId || !selectedDefense || isSubmitting) return;

    setIsSubmitting(true);
    console.debug('[Battle HUD] Submitting defense:', selectedDefense);

    try {
      const result = await submitDefense(sessionId, selectedDefense);
      console.debug('[Battle HUD] Defense result:', result);
    } catch (error) {
      console.error('[Battle HUD] Defense error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) return null;

  const isResolved = state.status === 'resolved';
  const canDefend = state.status === 'await_defense' && timeLeft > 0 && !isSubmitting;

  return (
    <Card className="fixed bottom-20 right-4 w-80 z-40 shadow-lg border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Battle Active</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {state.status === 'await_defense' && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{timeLeft}s</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {isExpanded && (
          <CardDescription className="text-xs">
            {isResolved
              ? state.winnerId
                ? `Battle resolved - Winner: ${state.winnerId.slice(0, 8)}...`
                : 'Battle concluded'
              : 'You are under attack! Select defense.'}
          </CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {!isResolved ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Select Defense
                </label>
                <Select
                  value={selectedDefense}
                  onValueChange={setSelectedDefense}
                  disabled={!canDefend || catalogLoading}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Choose defense..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : defenseCatalog.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No defenses available
                      </SelectItem>
                    ) : (
                      defenseCatalog.map((defense) => (
                        <SelectItem key={defense.key} value={defense.key}>
                          {defense.name} (Power: {defense.power})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleDefend}
                disabled={!canDefend || !selectedDefense}
                className="w-full h-9 text-sm"
                variant={timeLeft < 10 ? 'destructive' : 'default'}
              >
                {isSubmitting ? 'Activating...' : timeLeft < 10 ? 'DEFEND NOW!' : 'Activate Defense'}
              </Button>

              {timeLeft === 0 && state.status === 'await_defense' && (
                <p className="text-xs text-destructive text-center">Time expired - awaiting resolution</p>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm font-medium">Battle Concluded</p>
              {state.winnerId && (
                <p className="text-xs text-muted-foreground">Winner: {state.winnerId.slice(0, 12)}...</p>
              )}
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm" className="mt-2">
                  Close
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
