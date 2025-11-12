// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { useBattleSystem } from '@/hooks/useBattleSystem';
import { useBattleRealtimeSubscription, type BattleEventType } from '@/hooks/useBattleRealtimeSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Shield, Swords, Clock, Activity } from 'lucide-react';

interface BattleHUDProps {
  sessionId: string | null;
  onClose?: () => void;
}

interface ActionHistoryItem {
  id: string;
  type: BattleEventType;
  timestamp: number;
  description: string;
}

export function BattleHUD({ sessionId, onClose }: BattleHUDProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDefense, setSelectedDefense] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);

  const { submitDefense, getDefenseCatalog } = useBattleSystem();
  const [defenseCatalog, setDefenseCatalog] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const { state } = useBattleRealtimeSubscription(sessionId);

  // Load defense catalog
  useEffect(() => {
    if (!sessionId) return;
    
    const loadDefenses = async () => {
      setCatalogLoading(true);
      const defenses = await getDefenseCatalog();
      setDefenseCatalog(defenses);
      setCatalogLoading(false);
    };
    
    loadDefenses();
  }, [sessionId, getDefenseCatalog]);

  // Track action history from realtime events
  useEffect(() => {
    if (!state.lastEvent) return;

    const newAction: ActionHistoryItem = {
      id: `${state.lastEvent.type}-${Date.now()}`,
      type: state.lastEvent.type,
      timestamp: Date.now(),
      description: formatEventDescription(state.lastEvent.type, state.lastEvent.payload),
    };

    setActionHistory((prev) => [newAction, ...prev].slice(0, 3));
    console.debug('[BattleHUD] New action:', newAction);
  }, [state.lastEvent]);

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
    console.debug('[BattleHUD] Submitting defense:', selectedDefense);

    try {
      const result = await submitDefense(sessionId, selectedDefense);
      console.debug('[BattleHUD] Defense result:', result);
    } catch (error) {
      console.error('[BattleHUD] Defense error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) return null;

  const isResolved = state.status === 'resolved';
  const isCancelled = state.status === 'cancelled';
  const canDefend = state.status === 'await_defense' && timeLeft > 0 && !isSubmitting;

  const getStatusColor = () => {
    if (isResolved) return 'text-muted-foreground';
    if (isCancelled) return 'text-muted-foreground';
    if (timeLeft < 10) return 'text-destructive';
    return 'text-foreground';
  };

  const getStatusText = () => {
    if (isResolved) return state.winnerId ? `Winner: ${state.winnerId.slice(0, 8)}...` : 'Battle concluded';
    if (isCancelled) return 'Battle cancelled';
    return 'You are under attack!';
  };

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
          <CardDescription className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {/* Action History */}
          {actionHistory.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Recent Actions
              </label>
              <ScrollArea className="h-16 rounded-md border border-border/50 bg-muted/30">
                <div className="p-2 space-y-1">
                  {actionHistory.map((action) => (
                    <div key={action.id} className="text-xs text-muted-foreground">
                      <span className="font-mono text-[10px]">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                      {' · '}
                      <span>{action.description}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {!isResolved && !isCancelled ? (
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
              <p className="text-sm font-medium">
                {isCancelled ? 'Battle Cancelled' : 'Battle Concluded'}
              </p>
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

function formatEventDescription(type: BattleEventType, payload: any): string {
  switch (type) {
    case 'attack_started':
      return `Attack initiated with ${payload?.weapon || 'weapon'}`;
    case 'defense_needed':
      return 'Defense window open';
    case 'battle_resolved':
      return `Battle resolved - ${payload?.outcome || 'complete'}`;
    default:
      return `Event: ${type}`;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
