// © 2025 Joseph MULÉ – M1SSION™ – Bulk Ingest Orchestrator
import { useState } from 'react';
import { Upload, Loader2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { norahIngest, norahEmbed, norahSearch, norahKpis } from '@/lib/norah/api';
import type { NorahDocument } from '@/lib/norah/enrichment';

interface BulkIngestProps {
  documents: NorahDocument[];
  onComplete?: () => void;
}

type Step = 'idle' | 'dry-run' | 'ingesting' | 'embedding' | 'testing' | 'complete';

export default function BulkIngest({ documents, onComplete }: BulkIngestProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    inserted: 0,
    embedded: 0,
    testResults: [] as any[],
    kpis: null as any,
  });

  const runDryRun = async () => {
    setStep('dry-run');
    try {
      // Just show preview - no actual API call
      toast({
        title: '👁️ Dry Run Complete',
        description: `${documents.length} docs ready to ingest`,
      });
      setStep('idle');
    } catch (error: any) {
      toast({ title: '❌ Dry Run Failed', description: error.message, variant: 'destructive' });
      setStep('idle');
    }
  };

  const runIngest = async () => {
    setStep('ingesting');
    setProgress(0);
    
    try {
      // Split into batches of 20
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < documents.length; i += batchSize) {
        batches.push(documents.slice(i, i + batchSize));
      }
      
      let totalInserted = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const result = await norahIngest('content-ai', batch);
        totalInserted += result.inserted || 0;
        setProgress(((i + 1) / batches.length) * 100);
      }
      
      setStats(prev => ({ ...prev, inserted: totalInserted }));
      toast({
        title: '✅ Ingest Complete',
        description: `Inserted ${totalInserted} documents`,
      });
      setStep('idle');
    } catch (error: any) {
      toast({ title: '❌ Ingest Failed', description: error.message, variant: 'destructive' });
      setStep('idle');
    }
  };

  const runEmbed = async () => {
    setStep('embedding');
    setProgress(0);
    
    try {
      let totalEmbedded = 0;
      let remaining = 1;
      
      while (remaining > 0) {
        const result = await norahEmbed({ reembed: false, batch: 200 });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
        setProgress(Math.min(95, (totalEmbedded / (totalEmbedded + remaining)) * 100));
      }
      
      setStats(prev => ({ ...prev, embedded: totalEmbedded }));
      setProgress(100);
      toast({
        title: '✅ Embedding Complete',
        description: `Generated ${totalEmbedded} embeddings`,
      });
      setStep('idle');
    } catch (error: any) {
      toast({ title: '❌ Embedding Failed', description: error.message, variant: 'destructive' });
      setStep('idle');
    }
  };

  const runSmokeTest = async () => {
    setStep('testing');
    
    try {
      const queries = [
        'Push SAFE Guard',
        'Buzz Map pricing',
        'Norah RAG flow',
      ];
      
      const results = [];
      for (const q of queries) {
        const result = await norahSearch(q);
        results.push({ query: q, hits: result.results?.length || 0, results: result.results || [] });
      }
      
      setStats(prev => ({ ...prev, testResults: results }));
      toast({
        title: '✅ Smoke Test Complete',
        description: `${results.reduce((sum, r) => sum + r.hits, 0)} total hits`,
      });
      setStep('idle');
    } catch (error: any) {
      toast({ title: '❌ Smoke Test Failed', description: error.message, variant: 'destructive' });
      setStep('idle');
    }
  };

  const runComplete = async () => {
    await runIngest();
    await new Promise(r => setTimeout(r, 1000));
    await runEmbed();
    await new Promise(r => setTimeout(r, 1000));
    await runSmokeTest();
    setStep('complete');
    
    // Fetch final KPIs
    try {
      const kpis = await norahKpis();
      setStats(prev => ({ ...prev, kpis }));
    } catch {}
    
    onComplete?.();
  };

  const isRunning = step !== 'idle' && step !== 'complete';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <Upload className="w-5 h-5" />
          Bulk Ingest Pipeline
        </CardTitle>
        <CardDescription>
          {documents.length} documents ready • Step: {step}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">
              {progress.toFixed(1)}% complete
            </p>
          </div>
        )}

        {/* Step Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={runDryRun} disabled={isRunning || documents.length === 0} variant="outline" size="sm">
            👁️ Step 1: Dry Run
          </Button>
          <Button onClick={runIngest} disabled={isRunning || documents.length === 0} variant="outline" size="sm">
            {step === 'ingesting' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            📤 Step 2: Send to Norah
          </Button>
          <Button onClick={runEmbed} disabled={isRunning} variant="outline" size="sm">
            {step === 'embedding' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            ✨ Step 3: Embed Now
          </Button>
          <Button onClick={runSmokeTest} disabled={isRunning} variant="outline" size="sm">
            {step === 'testing' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            🔍 Step 4: Smoke Test
          </Button>
        </div>

        {/* Run All */}
        <Button onClick={runComplete} disabled={isRunning || documents.length === 0} className="w-full" size="lg">
          {isRunning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          🚀 Run Complete Pipeline
        </Button>

        {/* Stats */}
        {(stats.inserted > 0 || stats.embedded > 0 || stats.testResults.length > 0) && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold font-orbitron">Pipeline Stats:</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Inserted</p>
                <p className="text-2xl font-bold font-orbitron">{stats.inserted}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Embedded</p>
                <p className="text-2xl font-bold font-orbitron">{stats.embedded}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Test Hits</p>
                <p className="text-2xl font-bold font-orbitron">
                  {stats.testResults.reduce((sum, r) => sum + r.hits, 0)}
                </p>
              </div>
            </div>
            
            {stats.testResults.length > 0 && (
              <div className="mt-4 space-y-1">
                {stats.testResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <code>{r.query}</code>
                    <Badge variant={r.hits > 0 ? 'default' : 'secondary'}>{r.hits} hits</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm font-semibold text-green-500">Pipeline Complete!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
