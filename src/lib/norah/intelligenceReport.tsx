// © 2025 Joseph MULÉ – M1SSION™ – Intelligence Report Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';
import type { IntelligenceMetrics } from './intelligenceEval';

interface IntelligenceReportProps {
  report: {
    timestamp: string;
    docs: number;
    embeddings: number;
    last_embed_at?: string;
    metrics: IntelligenceMetrics;
    verdict: string;
    questions_tested: number;
  };
}

export function IntelligenceReport({ report }: IntelligenceReportProps) {
  const { metrics, verdict, docs, embeddings, questions_tested } = report;
  
  const getVerdictColor = (v: string) => {
    if (v.includes('SMARTER')) return 'text-green-500';
    if (v.includes('SAME')) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-orbitron">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            🧠 NORAH AI 2.0 — INTELLIGENCE REPORT
          </div>
          <Badge variant="default" className={`text-lg ${getVerdictColor(verdict)}`}>
            {verdict}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Knowledge Base Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="text-3xl font-bold font-orbitron">{docs}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">Embeddings</p>
            <p className="text-3xl font-bold font-orbitron">{embeddings}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-xs text-muted-foreground">Questions</p>
            <p className="text-3xl font-bold font-orbitron">{questions_tested}</p>
          </div>
        </div>

        {/* Pass Rates */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Pass@1</span>
              <span className="text-sm font-bold">{metrics.pass1.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.pass1} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: ≥65%</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Pass@3</span>
              <span className="text-sm font-bold">{metrics.pass3.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.pass3} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: ≥85%</p>
          </div>
        </div>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground mb-1">Contextual</p>
            <p className={`text-xl font-bold font-orbitron ${getScoreColor(metrics.contextual_reasoning)}`}>
              {metrics.contextual_reasoning.toFixed(1)}/10
            </p>
          </div>
          
          <div className="p-3 rounded-lg border text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground mb-1">Semantic</p>
            <p className={`text-xl font-bold font-orbitron ${getScoreColor(metrics.semantic_depth)}`}>
              {metrics.semantic_depth.toFixed(1)}/10
            </p>
          </div>
          
          <div className="p-3 rounded-lg border text-center">
            <Brain className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground mb-1">Cross-Module</p>
            <p className={`text-xl font-bold font-orbitron ${getScoreColor(metrics.cross_module_understanding)}`}>
              {metrics.cross_module_understanding.toFixed(1)}/10
            </p>
          </div>
        </div>

        {/* Intelligence Gain */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Intelligence Gain vs Baseline</span>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold font-orbitron ${metrics.intelligence_gain > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.intelligence_gain > 0 ? '+' : ''}{metrics.intelligence_gain.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <h3 className="text-sm font-semibold font-orbitron">🎯 Final Assessment</h3>
          <div className="space-y-1 text-xs">
            {metrics.pass1 >= 65 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pass@1 target achieved (≥65%)</span>
              </div>
            )}
            {metrics.pass3 >= 85 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pass@3 target achieved (≥85%)</span>
              </div>
            )}
            {metrics.intelligence_gain > 30 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Significant intelligence improvement (+{metrics.intelligence_gain.toFixed(0)}%)</span>
              </div>
            )}
            {docs >= 150 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Knowledge base adequately populated ({docs} docs)</span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground text-center">
          Report generated: {new Date(report.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
