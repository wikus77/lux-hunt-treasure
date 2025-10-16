// © 2025 Joseph MULÉ – M1SSION™ – Evaluation Harness for RAG Quality
import { useState } from 'react';
import { TestTube, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { norahSearch } from '@/lib/norah/api';

interface GoldQuestion {
  query: string;
  expected_keywords: string[];
  expected_url?: string;
  lang?: 'it' | 'en';
}

const DEFAULT_GOLD: GoldQuestion[] = [
  {
    query: 'Push SAFE Guard',
    expected_keywords: ['guard', 'push', 'security', 'prebuild'],
    lang: 'it',
  },
  {
    query: 'Buzz Map pricing tiers',
    expected_keywords: ['buzz', 'pricing', 'silver', 'gold', 'tier'],
    lang: 'it',
  },
  {
    query: 'Norah RAG flow',
    expected_keywords: ['rag', 'embedding', 'cloudflare', 'vector'],
    lang: 'it',
  },
  {
    query: 'Final Shot rules',
    expected_keywords: ['final', 'shot', 'mission', 'prize'],
    lang: 'it',
  },
  {
    query: 'Subscription levels',
    expected_keywords: ['subscription', 'silver', 'gold', 'black', 'titanium'],
    lang: 'it',
  },
];

export default function EvalHarness() {
  const { toast } = useToast();
  const [goldQuestions, setGoldQuestions] = useState<string>(JSON.stringify(DEFAULT_GOLD, null, 2));
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const runEval = async () => {
    setRunning(true);
    setProgress(0);
    setResults([]);
    
    try {
      const questions: GoldQuestion[] = JSON.parse(goldQuestions);
      const evalResults = [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const searchResult = await norahSearch(q.query);
        const hits = searchResult.results || [];
        
        // MMR re-ranking (diversity boost)
        const reranked = hits; // TODO: Implement MMR if needed
        
        // Check if top-3 match expected keywords
        const top3 = reranked.slice(0, 3);
        const allText = top3.map(h => h.chunkText || h.chunk_text || '').join(' ').toLowerCase();
        
        const matchedKeywords = q.expected_keywords.filter(kw => allText.includes(kw.toLowerCase()));
        const pass1 = top3.length > 0 && matchedKeywords.length >= 1;
        const pass3 = matchedKeywords.length >= Math.min(2, q.expected_keywords.length);
        
        // Check citation
        const hasCitation = top3.some(h => h.title || h.url);
        
        evalResults.push({
          query: q.query,
          pass1,
          pass3,
          hasCitation,
          matchedKeywords,
          totalKeywords: q.expected_keywords.length,
          hits: hits.length,
          top3,
        });
        
        setProgress(((i + 1) / questions.length) * 100);
      }
      
      setResults(evalResults);
      
      const pass1Count = evalResults.filter(r => r.pass1).length;
      const pass3Count = evalResults.filter(r => r.pass3).length;
      const citationCount = evalResults.filter(r => r.hasCitation).length;
      
      toast({
        title: '✅ Evaluation Complete',
        description: `Pass@1: ${((pass1Count / evalResults.length) * 100).toFixed(1)}% | Pass@3: ${((pass3Count / evalResults.length) * 100).toFixed(1)}%`,
      });
    } catch (error: any) {
      toast({ title: '❌ Evaluation Failed', description: error.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const exportResults = () => {
    const csv = [
      'Query,Pass@1,Pass@3,Citation,Matched Keywords,Total Keywords,Hits',
      ...results.map(r => 
        `"${r.query}",${r.pass1},${r.pass3},${r.hasCitation},${r.matchedKeywords.length},${r.totalKeywords},${r.hits}`
      ),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `norah-eval-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: '✅ Exported', description: 'Evaluation results downloaded' });
  };

  const exportJSON = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `norah-eval-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: '✅ Exported', description: 'Evaluation results downloaded (JSON)' });
  };

  const pass1Rate = results.length > 0 ? (results.filter(r => r.pass1).length / results.length) * 100 : 0;
  const pass3Rate = results.length > 0 ? (results.filter(r => r.pass3).length / results.length) * 100 : 0;
  const citationRate = results.length > 0 ? (results.filter(r => r.hasCitation).length / results.length) * 100 : 0;
  const avgHits = results.length > 0 ? results.reduce((sum, r) => sum + r.hits, 0) / results.length : 0;

  return (
    <div className="space-y-4">
      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <TestTube className="w-5 h-5" />
            Evaluation Harness
          </CardTitle>
          <CardDescription>
            Test RAG quality with gold questions (JSON format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={goldQuestions}
            onChange={(e) => setGoldQuestions(e.target.value)}
            rows={12}
            className="font-mono text-xs"
            placeholder='[{"query": "...", "expected_keywords": [...], "lang": "it"}]'
            disabled={running}
          />
          
          {running && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                Running evaluation: {progress.toFixed(1)}%
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={runEval} disabled={running} className="flex-1">
              {running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
              Run Eval
            </Button>
            {results.length > 0 && (
              <>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={exportJSON} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-orbitron">KPI Dashboard</CardTitle>
            <CardDescription>{results.length} questions evaluated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Pass@1</p>
                <p className="text-2xl font-bold font-orbitron">{pass1Rate.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Pass@3</p>
                <p className="text-2xl font-bold font-orbitron">{pass3Rate.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Citation Rate</p>
                <p className="text-2xl font-bold font-orbitron">{citationRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Avg Hits</p>
                <p className="text-2xl font-bold font-orbitron">{avgHits.toFixed(1)}</p>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex gap-1">
                    {r.pass1 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    {r.pass3 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <code className="text-sm font-semibold">{r.query}</code>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {r.matchedKeywords.length}/{r.totalKeywords} keywords
                      </Badge>
                      <Badge variant={r.hasCitation ? 'default' : 'secondary'} className="text-xs">
                        {r.hasCitation ? '✓ Citation' : '✗ No Citation'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{r.hits} hits</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
