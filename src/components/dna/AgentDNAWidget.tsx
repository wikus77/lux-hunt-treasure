import { useEffect, useState } from 'react';
import { dnaClient, type AgentDNA } from '@/lib/dna/dnaClient';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Shield, TrendingUp, Radio } from 'lucide-react';

interface AgentDNAWidgetProps {
  compact?: boolean;
}

const DNA_PARAMS = [
  { key: 'intuito', label: 'Intuito', icon: Brain, color: 'hsl(var(--primary))' },
  { key: 'audacia', label: 'Audacia', icon: Zap, color: 'hsl(var(--chart-1))' },
  { key: 'etica', label: 'Etica', icon: Shield, color: 'hsl(var(--chart-2))' },
  { key: 'rischio', label: 'Rischio', icon: TrendingUp, color: 'hsl(var(--chart-3))' },
  { key: 'vibrazione', label: 'Vibrazione', icon: Radio, color: 'hsl(var(--chart-4))' },
] as const;

const AgentDNAWidget = ({ compact = false }: AgentDNAWidgetProps) => {
  const [dna, setDna] = useState<AgentDNA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDNA();
  }, []);

  const loadDNA = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const dnaData = await dnaClient.getDna(user.id);
      setDna(dnaData);
    } catch (error) {
      console.error('❌ Failed to load DNA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 living-hud-glass">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!dna) {
    return (
      <Card className="p-4 living-hud-glass">
        <p className="text-sm text-muted-foreground">DNA not initialized</p>
      </Card>
    );
  }

  return (
    <Card className="living-hud-glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          M1SSION DNA™
        </h3>
        {!compact && (
          <Button variant="ghost" size="sm" className="text-xs h-7">
            Affina
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {DNA_PARAMS.map(({ key, label, icon: Icon, color }) => {
          const value = dna[key] || 50;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="font-medium text-foreground">{label}</span>
                </div>
                <span className="font-mono text-muted-foreground">
                  {value}/100
                </span>
              </div>
              {!compact && (
                <Progress 
                  value={value} 
                  className="h-1.5"
                  style={{
                    '--progress-background': color,
                  } as React.CSSProperties}
                />
              )}
            </div>
          );
        })}
      </div>

      {compact && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs mt-2"
          onClick={() => {/* TODO: Open DNA panel */}}
        >
          Visualizza DNA
        </Button>
      )}
    </Card>
  );
};

export default AgentDNAWidget;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
