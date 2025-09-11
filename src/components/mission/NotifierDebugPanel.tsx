/**
 * © 2025 Joseph MULÉ – M1SSION™ Notifier Debug Panel
 * Visible only with ?M1_DIAG=1 for development diagnostics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Bell, Settings, ExternalLink, RefreshCw } from 'lucide-react';

interface NotifierDebugPanelProps {
  className?: string;
}

interface DryRunResult {
  user_id: string;
  resolved_tags: string[];
  qualified_items_count: number;
  candidates_count: number;
  candidates_sample: any[];
  cooldown_hours: number;
  total_ever: number;
  recent_suggestions?: number;
  recent_suggestions_12h?: number;
  throttle_applied: boolean;
  throttle_reason: string;
  would_send: boolean;
}

export const NotifierDebugPanel: React.FC<NotifierDebugPanelProps> = ({ className }) => {
  const { getCurrentUser } = useUnifiedAuth();
  const currentUser = getCurrentUser();
  const [debugResult, setDebugResult] = useState<DryRunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only render if M1_DIAG=1 is present
  const isDiagMode = new URL(window.location.href).searchParams.has('M1_DIAG');
  
  if (!isDiagMode || !currentUser) {
    return null;
  }

  const runDryTest = async (cooldownHours?: number) => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct call to notifier-engine dry-run endpoint with diag=1
      const params = new URLSearchParams({
        user_id: currentUser.id,
        max: '5',
        diag: '1'
      });
      
      if (cooldownHours !== undefined) {
        params.set('cooldown', cooldownHours.toString());
      }
      
      const response = await fetch(
        `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/notifier-engine/dry-run?${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result?.error) {
        setError(result.error);
      } else {
        setDebugResult(result);
        
        // Enhanced logging for console.table
        if (result.candidates_sample && result.candidates_sample.length > 0) {
          console.log('🎯 M1SSION Notifier Candidates:');
          console.table(result.candidates_sample.map((c: any) => ({
            Title: c.title?.substring(0, 50) + '...',
            Score: c.score?.toFixed(2),
            Tags: c.tags?.join(', '),
            Published: new Date(c.published_at).toLocaleString()
          })));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Dry-run error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openFunctionLogs = () => {
    const url = 'https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/notifier-engine/logs';
    window.open(url, '_blank');
  };

  return (
    <Card className={`border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Bell className="h-5 w-5" />
          Notifier Debug Panel
          <Badge variant="outline" className="text-xs border-orange-500/30">
            DEV ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            User ID: <span className="font-mono text-xs">{currentUser.id}</span>
          </p>
          {debugResult && (
            <p className="text-muted-foreground">
              Resolved Tags: <span className="text-orange-300">{debugResult.resolved_tags.join(', ') || 'None'}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => runDryTest(1)}
            disabled={isLoading}
            className="border-orange-500/30 hover:bg-orange-500/10"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Dry-run (cooldown=1h)
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => runDryTest()}
            disabled={isLoading}
            className="border-orange-500/30 hover:bg-orange-500/10"
          >
            Dry-run (default)
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={openFunctionLogs}
            className="text-orange-400 hover:bg-orange-500/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Function Logs
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results Display */}
        {debugResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Candidates Found</p>
                <p className="text-lg font-semibold text-orange-400">
                  {debugResult.candidates_count}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Would Send</p>
                <Badge 
                  variant={debugResult.would_send ? "default" : "destructive"}
                  className={debugResult.would_send ? "bg-green-500/20 text-green-400" : ""}
                >
                  {debugResult.would_send ? 'YES' : 'NO'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Total Ever</p>
                <p className="font-mono">{debugResult.total_ever}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Recent</p>
                <p className="font-mono">{debugResult.recent_suggestions || debugResult.recent_suggestions_12h}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cooldown</p>
                <p className="font-mono">{debugResult.cooldown_hours}h</p>
              </div>
            </div>

            {debugResult.throttle_applied && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs text-yellow-400">
                <strong>Throttled:</strong> {debugResult.throttle_reason}
              </div>
            )}

            {debugResult.candidates_sample.length > 0 && (
              <div>
                <p className="text-sm font-medium text-orange-400 mb-2">Top Candidates:</p>
                <div className="space-y-1 text-xs">
                  {debugResult.candidates_sample.slice(0, 3).map((candidate, i) => (
                    <div key={candidate.id || i} className="flex justify-between bg-background/50 rounded p-2">
                      <span className="truncate">{candidate.title || 'No title'}</span>
                      <Badge variant="secondary" className="text-xs">
                        {candidate.score?.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};