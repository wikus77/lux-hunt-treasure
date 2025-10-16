// © 2025 Joseph MULÉ – M1SSION™ – Bulk Ingest Orchestrator
import { useState, useEffect } from 'react';
import { Upload, Loader2, Play, Zap, TestTube, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { norahIngest, norahEmbed, norahSearch, norahKpis } from '@/lib/norah/api';
import { useNorahStore } from '@/lib/norah/store';
import { generateM1SSIONKnowledgeBase } from '@/lib/norah/m1ssionDocGenerator';

interface BulkIngestProps {
  onComplete?: () => void;
}

type Step = 'idle' | 'dry-run' | 'ingesting' | 'embedding' | 'testing' | 'kpis' | 'complete';

export default function BulkIngest({ onComplete }: BulkIngestProps) {
  const { selectedDocs, setSelectedDocs } = useNorahStore();
  const [step, setStep] = useState<Step>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    inserted: 0,
    embedded: 0,
    testResults: [] as any[],
    kpis: null as any,
  });

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-99), `[${timestamp}] ${msg}`]);
    if (import.meta.env.DEV) {
      console.debug('[NORAH2]', msg);
    }
  };

  const generateM1SSIONKnowledge = () => {
    const contentDocs = generateM1SSIONKnowledgeBase();
    
    // Convert ContentDoc to EnrichedDoc format
    const enrichedDocs = contentDocs.map(doc => ({
      ...doc,
      summary: doc.text.substring(0, 150) + '...',
      autoTags: doc.tags || [],
      dedupeKey: `${doc.title}-${doc.source}`,
      chunks: [{ idx: 0, text: doc.text }],
    }));
    
    setSelectedDocs(enrichedDocs);
    addLog(`✅ Generated ${enrichedDocs.length} M1SSION™ synthetic documents`);
    toast.success(`Generated ${enrichedDocs.length} M1SSION™ documents for intelligence verification`);
  };

  const runDryRun = async () => {
    if (selectedDocs.length === 0) {
      toast.error("No documents selected");
      return;
    }
    
    setStep('dry-run');
    addLog(`Dry run: validating ${selectedDocs.length} documents`);
    
    try {
      const result = await norahIngest({
        documents: selectedDocs.map(d => ({
          title: d.title,
          text: d.text,
          tags: d.tags,
          source: d.source,
          url: d.url,
        })),
        dryRun: true
      });
      
      addLog(`✅ Dry run OK: ${selectedDocs.length} docs validated`);
      toast.success(`Dry run: ${selectedDocs.length} documents ready`);
      setStep('idle');
    } catch (error: any) {
      addLog(`❌ Dry run failed: ${error.message}`);
      toast.error(`Dry run failed: ${error.message}`);
      setStep('idle');
    }
  };

  const runIngest = async () => {
    if (selectedDocs.length === 0) {
      toast.error("No documents selected");
      return;
    }
    
    setStep('ingesting');
    setProgress(0);
    addLog(`Starting ingest: ${selectedDocs.length} documents`);
    
    try {
      // Split into batches of 20
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < selectedDocs.length; i += batchSize) {
        batches.push(selectedDocs.slice(i, i + batchSize));
      }
      
      let totalInserted = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        addLog(`Ingesting batch ${i+1}/${batches.length} (${batch.length} docs)`);
        
        // Micro-pacing between batches in preview
        if (i > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const result = await norahIngest({
          documents: batch.map(d => ({
            title: d.title,
            text: d.text,
            tags: d.tags,
            source: d.source,
            url: d.url,
          })),
          dryRun: false
        });
        
        totalInserted += result.inserted || 0;
        setProgress(((i + 1) / batches.length) * 100);
        addLog(`✅ Batch ${i+1} ingested`);
      }
      
      setStats(prev => ({ ...prev, inserted: totalInserted }));
      addLog(`✅ Total ingested: ${totalInserted} documents`);
      toast.success(`Inserted ${totalInserted} documents`);
      setStep('idle');
    } catch (error: any) {
      addLog(`❌ Ingest failed: ${error.message}`);
      toast.error(`Ingest failed: ${error.message}`);
      setStep('idle');
    }
  };

  const runEmbed = async () => {
    setStep('embedding');
    setProgress(0);
    addLog('Starting embedding (batch: 200)');
    
    try {
      let totalEmbedded = 0;
      let remaining = 1;
      
      let embedRound = 0;
      while (remaining > 0) {
        // Micro-pacing between embed batches in preview
        if (embedRound > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const result = await norahEmbed({ reembed: false, batch: 200 });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
        setProgress(Math.min(95, (totalEmbedded / (totalEmbedded + remaining)) * 100));
        addLog(`Embedded ${result.embedded || 0} chunks, ${remaining} remaining`);
        embedRound++;
      }
      
      setStats(prev => ({ ...prev, embedded: totalEmbedded }));
      setProgress(100);
      addLog(`✅ Embeddings generated: ${totalEmbedded}`);
      toast.success(`Generated ${totalEmbedded} embeddings`);
      setStep('idle');
    } catch (error: any) {
      addLog(`❌ Embed failed: ${error.message}`);
      toast.error(`Embed failed: ${error.message}`);
      setStep('idle');
    }
  };

  const runSmokeTest = async () => {
    setStep('testing');
    addLog('Starting RAG smoke test');
    
    try {
      const queries = [
        { q: 'Push SAFE Guard', top_k: 3 },
        { q: 'Buzz Map pricing', top_k: 3 },
        { q: 'Norah RAG flow', top_k: 3 },
      ];
      
      const results = [];
      for (const query of queries) {
        addLog(`RAG query: "${query.q}"`);
        const result = await norahSearch(query);
        const hits = result.results?.length || 0;
        results.push({ query: query.q, hits, results: result.results || [] });
        addLog(`  → ${hits} results`);
      }
      
      setStats(prev => ({ ...prev, testResults: results }));
      addLog(`✅ Smoke test complete: ${results.reduce((sum, r) => sum + r.hits, 0)} total hits`);
      toast.success(`Smoke test: ${results.reduce((sum, r) => sum + r.hits, 0)} total hits`);
      setStep('idle');
    } catch (error: any) {
      addLog(`❌ Smoke test failed: ${error.message}`);
      toast.error(`Smoke test failed: ${error.message}`);
      setStep('idle');
    }
  };

  const runComplete = async () => {
    if (selectedDocs.length === 0) {
      toast.error("No documents selected");
      return;
    }

    addLog('🚀 Starting Complete E2E Flow');
    
    // Step 1: Dry run
    setStep('dry-run');
    addLog('Step 1/5: Dry run validation');
    try {
      await norahIngest({
        documents: selectedDocs.map(d => ({
          title: d.title,
          text: d.text,
          tags: d.tags,
          source: d.source,
          url: d.url,
        })),
        dryRun: true
      });
      addLog('✅ Dry run passed');
    } catch (error: any) {
      addLog(`❌ Dry run failed: ${error.message}`);
      toast.error(`Flow stopped at dry run: ${error.message}`);
      setStep('idle');
      return;
    }

    // Step 2: Ingest
    setStep('ingesting');
    addLog('Step 2/5: Ingesting documents');
    try {
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < selectedDocs.length; i += batchSize) {
        batches.push(selectedDocs.slice(i, i + batchSize));
      }
      
      let totalInserted = 0;
      for (let i = 0; i < batches.length; i++) {
        // Micro-pacing between batches in preview
        if (i > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const result = await norahIngest({
          documents: batches[i].map(d => ({
            title: d.title,
            text: d.text,
            tags: d.tags,
            source: d.source,
            url: d.url,
          })),
          dryRun: false
        });
        totalInserted += result.inserted || 0;
        addLog(`  Batch ${i+1}/${batches.length} ingested`);
      }
      setStats(prev => ({ ...prev, inserted: totalInserted }));
      addLog(`✅ Ingested ${totalInserted} documents`);
    } catch (error: any) {
      addLog(`❌ Ingest failed: ${error.message}`);
      toast.error(`Flow stopped at ingest: ${error.message}`);
      setStep('idle');
      return;
    }

    // Step 3: Embed
    setStep('embedding');
    addLog('Step 3/5: Generating embeddings');
    try {
      let totalEmbedded = 0;
      let remaining = 1;
      let embedRoundComplete = 0;
      while (remaining > 0) {
        // Micro-pacing between embed batches in preview
        if (embedRoundComplete > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const result = await norahEmbed({ batch: 200, reembed: false });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
        embedRoundComplete++;
      }
      setStats(prev => ({ ...prev, embedded: totalEmbedded }));
      addLog(`✅ Embeddings generated: ${totalEmbedded}`);
    } catch (error: any) {
      addLog(`❌ Embed failed: ${error.message}`);
      toast.error(`Flow stopped at embed: ${error.message}`);
      setStep('idle');
      return;
    }

    // Step 4: RAG test
    setStep('testing');
    addLog('Step 4/5: RAG smoke test');
    try {
      const queries = [
        { q: 'Push SAFE Guard', top_k: 3 },
        { q: 'Buzz Map pricing', top_k: 3 }
      ];
      
      const results = [];
      for (const query of queries) {
        const res = await norahSearch(query);
        const count = res.results?.length || 0;
        results.push({ query: query.q, hits: count });
        addLog(`  Query "${query.q}": ${count} results`);
      }
      setStats(prev => ({ ...prev, testResults: results }));
      addLog('✅ RAG test passed');
    } catch (error: any) {
      addLog(`❌ RAG test failed: ${error.message}`);
      toast.error(`Flow stopped at RAG: ${error.message}`);
      setStep('idle');
      return;
    }

    // Step 5: KPIs
    setStep('kpis');
    addLog('Step 5/5: Refreshing KPIs');
    try {
      const result = await norahKpis();
      setStats(prev => ({ ...prev, kpis: result }));
      addLog(`✅ Final KPIs: ${result.documents} docs, ${result.embeddings} embeddings`);
      addLog('🎉 Complete E2E Flow finished successfully!');
      toast.success('Complete E2E Flow finished!');
      setStep('complete');
      onComplete?.();
    } catch (error: any) {
      addLog(`❌ KPIs refresh failed: ${error.message}`);
      toast.error(`Flow completed but KPIs failed: ${error.message}`);
      setStep('idle');
    }
  };

  const isRunning = step !== 'idle' && step !== 'complete';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <Upload className="w-5 h-5" />
            Bulk Ingest Pipeline
          </CardTitle>
          <CardDescription>
            {selectedDocs.length} documents ready • Step: {step}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate M1SSION Docs Button */}
          <Button 
            onClick={generateM1SSIONKnowledge} 
            disabled={isRunning}
            variant="secondary"
            size="lg" 
            className="w-full"
          >
            <Upload className="w-5 h-5 mr-2" />
            🧠 Generate M1SSION™ Knowledge Base (150+ docs)
          </Button>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                {progress.toFixed(1)}% complete
              </p>
            </div>
          )}

          {/* Run All */}
          <Button onClick={runComplete} disabled={isRunning || selectedDocs.length === 0} size="lg" className="w-full">
            {isRunning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
            🚀 Run Complete Flow
          </Button>

          {/* Step Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={runDryRun}
              disabled={isRunning || selectedDocs.length === 0}
              variant="outline"
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {step === 'dry-run' ? 'Running...' : 'Dry Run'}
            </Button>
            <Button
              onClick={runIngest}
              disabled={isRunning || selectedDocs.length === 0}
              variant="outline"
              size="sm"
            >
              {step === 'ingesting' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Ingest
            </Button>
            <Button
              onClick={runEmbed}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {step === 'embedding' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Embed
            </Button>
            <Button
              onClick={runSmokeTest}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {step === 'testing' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
              RAG Test
            </Button>
          </div>

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
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-sm font-semibold text-green-500">✅ Pipeline Complete!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log panel */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pipeline Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded border p-2 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-muted-foreground">{log}</div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
