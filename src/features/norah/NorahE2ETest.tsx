// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI E2E Test Panel — DEV ONLY
import { useState } from 'react';
import { TestTube, FileText, Sparkles, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { norahIngest, norahEmbed, norahSearch, norahKpis } from '@/lib/norah/api';
import { formatHttpError } from '@/lib/httpJson';

type TestStep = 'ingest' | 'embed' | 'rag' | 'kpis';
type TestResult = { ok: boolean; message: string; data?: any };

export default function NorahE2ETest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<TestStep | null>(null);
  const [results, setResults] = useState<Record<TestStep, TestResult | null>>({
    ingest: null,
    embed: null,
    rag: null,
    kpis: null,
  });

  const log = (step: TestStep, message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[NORAH E2E ${step.toUpperCase()}]`, message, data || '');
    }
  };

  // ============ 1️⃣ INGEST SAMPLE (3 docs, dryRun:false) ============
  const runIngestTest = async () => {
    setLoading('ingest');
    log('ingest', 'Starting ingest test with 3 sample documents...');
    
    const sampleDocs = [
      {
        title: 'M1SSION Push SAFE Guard',
        text: 'The Push SAFE Guard is a mandatory pre-build verification system that ensures no hardcoded secrets, URLs, or project references exist in the codebase before deployment. It scans all TypeScript/JavaScript files and blocks builds if violations are detected. The Guard is implemented in scripts/push-guard.cjs and runs via pnpm run prebuild.',
        tags: ['guard', 'push', 'security'],
        source: 'e2e-test',
        url: 'test://push-safe-guard',
      },
      {
        title: 'Buzz Map Pricing Tiers',
        text: 'Buzz Map offers multiple pricing tiers: Free (limited features), Silver (early access), Gold (24h early access), Black (48h early access), and Titanium (72h early access). Each tier provides incremental benefits including XP bonuses, free Buzz credits, and priority support. Pricing is dynamic based on daily usage patterns.',
        tags: ['buzz', 'pricing', 'tiers'],
        source: 'e2e-test',
        url: 'test://buzz-pricing',
      },
      {
        title: 'Norah RAG Query Flow',
        text: 'Norah RAG (Retrieval-Augmented Generation) uses Cloudflare Workers AI with @cf/baai/bge-base-en-v1.5 embedding model (768 dimensions). The flow: 1) User query → 2) Generate embedding → 3) Vector search in ai_docs_embeddings → 4) Return top-k chunks with cosine similarity. Minimum score threshold: 0.1. Default top_k: 3.',
        tags: ['rag', 'flow', 'cloudflare'],
        source: 'e2e-test',
        url: 'test://rag-flow',
      },
    ];

    try {
      log('ingest', 'Calling norahIngest with dryRun:false', { count: sampleDocs.length });
      const result = await norahIngest({ documents: sampleDocs, dryRun: false });
      const inserted = result.inserted || 0;
      log('ingest', `Ingest completed: ${inserted} inserted`, result);
      
      setResults(prev => ({
        ...prev,
        ingest: {
          ok: inserted > 0,
          message: inserted > 0 ? `✅ Inserted ${inserted} docs` : '⚠️ No docs inserted',
          data: result,
        },
      }));
      
      toast({
        title: inserted > 0 ? '✅ Ingest Success' : '⚠️ Ingest Warning',
        description: `Inserted: ${inserted} docs`,
        variant: inserted > 0 ? 'default' : 'destructive',
      });
    } catch (error: any) {
      const msg = formatHttpError(error);
      log('ingest', `❌ ${msg}`, error);
      setResults(prev => ({
        ...prev,
        ingest: { ok: false, message: `❌ ${msg}` },
      }));
      toast({ title: '❌ Ingest Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ============ 2️⃣ EMBED BATCHES (batch=5, then batch=20) ============
  const runEmbedTest = async () => {
    setLoading('embed');
    log('embed', 'Starting embed test: batch=5 then batch=20...');
    
    try {
      // First batch: 5
      log('embed', 'Running batch=5...');
      const result1 = await norahEmbed({ reembed: false, batch: 5 });
      const embedded1 = result1.embedded || 0;
      log('embed', `Batch 1 completed: ${embedded1} embedded`, result1);
      
      // Second batch: 20
      log('embed', 'Running batch=20...');
      const result2 = await norahEmbed({ reembed: false, batch: 20 });
      const embedded2 = result2.embedded || 0;
      log('embed', `Batch 2 completed: ${embedded2} embedded`, result2);
      
      const totalEmbedded = embedded1 + embedded2;
      
      setResults(prev => ({
        ...prev,
        embed: {
          ok: totalEmbedded > 0,
          message: totalEmbedded > 0 
            ? `✅ Generated ${totalEmbedded} embeddings (batch1: ${embedded1}, batch2: ${embedded2})` 
            : '⚠️ No embeddings generated',
          data: { batch1: result1, batch2: result2 },
        },
      }));
      
      toast({
        title: totalEmbedded > 0 ? '✅ Embed Success' : '⚠️ Embed Warning',
        description: `Total embedded: ${totalEmbedded}`,
        variant: totalEmbedded > 0 ? 'default' : 'destructive',
      });
    } catch (error: any) {
      const msg = formatHttpError(error);
      log('embed', `❌ ${msg}`, error);
      setResults(prev => ({
        ...prev,
        embed: { ok: false, message: `❌ ${msg}` },
      }));
      toast({ title: '❌ Embed Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ============ 3️⃣ RAG QUICK TEST (2 queries) ============
  const runRagTest = async () => {
    setLoading('rag');
    log('rag', 'Starting RAG test with 2 queries...');
    
    const queries = [
      'M1SSION Push SAFE Guard',
      'Buzz Map pricing',
    ];
    
    try {
      const allResults: any[] = [];
      
      for (const q of queries) {
        if (!q.trim()) {
          log('rag', `Skipping empty query`);
          allResults.push({ query: q, ok: false, error: 'empty-query', results: [] });
          continue;
        }
        log('rag', `Searching: "${q}"`);
        const result = await norahSearch({ q, top_k: 5 });
        const hits = result.results || [];
        log('rag', `Query "${q}" returned ${hits.length} hits`, hits);
        allResults.push({ query: q, hits });
      }
      
      const totalHits = allResults.reduce((sum, r) => sum + r.hits.length, 0);
      
      setResults(prev => ({
        ...prev,
        rag: {
          ok: totalHits > 0,
          message: totalHits > 0 
            ? `✅ Found ${totalHits} total results across ${queries.length} queries` 
            : '⚠️ No results found',
          data: allResults,
        },
      }));
      
      toast({
        title: totalHits > 0 ? '✅ RAG Success' : '⚠️ RAG Warning',
        description: `Total hits: ${totalHits}`,
        variant: totalHits > 0 ? 'default' : 'destructive',
      });
    } catch (error: any) {
      const msg = formatHttpError(error);
      log('rag', `❌ ${msg}`, error);
      setResults(prev => ({
        ...prev,
        rag: { ok: false, message: `❌ ${msg}` },
      }));
      toast({ title: '❌ RAG Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ============ 4️⃣ REFRESH KPIs ============
  const runKpisTest = async () => {
    setLoading('kpis');
    log('kpis', 'Fetching KPIs...');
    
    try {
      const result = await norahKpis();
      log('kpis', 'KPIs fetched', result);
      
      const hasDocs = (result.docs_count || 0) > 0;
      const hasEmbeds = (result.chunks_count || 0) > 0;
      
      setResults(prev => ({
        ...prev,
        kpis: {
          ok: hasDocs && hasEmbeds,
          message: hasDocs && hasEmbeds 
            ? `✅ Docs: ${result.docs_count}, Embeddings: ${result.chunks_count}` 
            : `⚠️ Docs: ${result.docs_count || 0}, Embeddings: ${result.chunks_count || 0}`,
          data: result,
        },
      }));
      
      toast({
        title: hasDocs && hasEmbeds ? '✅ KPIs OK' : '⚠️ KPIs Warning',
        description: `Docs: ${result.docs_count || 0}, Embeddings: ${result.chunks_count || 0}`,
      });
    } catch (error: any) {
      const msg = formatHttpError(error);
      log('kpis', `❌ ${msg}`, error);
      setResults(prev => ({
        ...prev,
        kpis: { ok: false, message: `❌ ${msg}` },
      }));
      toast({ title: '❌ KPIs Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  // ============ RUN ALL ============
  const runAllTests = async () => {
    await runIngestTest();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
    await runEmbedTest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await runRagTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    await runKpisTest();
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <TestTube className="w-5 h-5 text-primary" />
          Norah E2E Test Suite
          <Badge variant="secondary">DEV ONLY</Badge>
        </CardTitle>
        <CardDescription>
          End-to-End verification: Ingest → Embed → RAG → KPIs (Cloudflare AI)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={runIngestTest} 
            disabled={!!loading}
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            1️⃣ Ingest (3 docs)
          </Button>
          <Button 
            onClick={runEmbedTest} 
            disabled={!!loading}
            variant="outline"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            2️⃣ Embed (2 batches)
          </Button>
          <Button 
            onClick={runRagTest} 
            disabled={!!loading}
            variant="outline"
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            3️⃣ RAG (2 queries)
          </Button>
          <Button 
            onClick={runKpisTest} 
            disabled={!!loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            4️⃣ Refresh KPIs
          </Button>
        </div>

        {/* Run All */}
        <Button 
          onClick={runAllTests} 
          disabled={!!loading}
          className="w-full"
          size="lg"
        >
          {loading ? `⏳ Running ${loading}...` : '🚀 Run Complete E2E Flow'}
        </Button>

        {/* Results */}
        {Object.values(results).some(r => r !== null) && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold font-orbitron">Test Results:</h3>
            {Object.entries(results).map(([step, result]) => 
              result ? (
                <div 
                  key={step} 
                  className={`flex items-start gap-2 p-2 rounded text-sm ${
                    result.ok ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {result.ok ? '✅' : '❌'}
                  <div className="flex-1">
                    <code className="text-xs font-semibold">{step}</code>
                    <p className="text-xs mt-1">{result.message}</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Dev Note */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-muted-foreground">
            <strong>Console logs:</strong> Open DevTools Console to see detailed step-by-step logs prefixed with <code>[NORAH E2E ...]</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
