// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { useState, useEffect } from "react";
import { Brain, Database, Search, Activity, Loader2, AlertCircle, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { norahIngest, norahEmbed, norahSearch, norahKpis } from "@/lib/norah/api";
import { verifyEdgeFunction, functionsBaseUrl } from "@/lib/supabase/functionsBase";

export default function NorahAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [edgeDiag, setEdgeDiag] = useState<Record<string, any>>({});

  const handleIngest = async () => {
    setLoading("ingest");
    try {
      // Fetch sample docs from content/ai folder
      const sampleDocs = [
        { title: "Product Overview", tags: ["product", "overview"], url: "/content/ai/01-product-overview.md" },
        { title: "Push Architecture", tags: ["push", "technical"], url: "/content/ai/02-push-architecture.md" },
        { title: "Privacy and Security", tags: ["security", "privacy"], url: "/content/ai/03-privacy-and-security.md" },
        { title: "Norah RAG How It Works", tags: ["norah", "ai", "rag"], url: "/content/ai/04-norah-rag-how-it-works.md" },
        { title: "User FAQ", tags: ["faq", "support"], url: "/content/ai/05-user-faq.md" },
        { title: "Dev Playbook", tags: ["dev", "playbook"], url: "/content/ai/06-dev-playbook.md" },
        { title: "Terms Highlights", tags: ["legal", "terms"], url: "/content/ai/07-terms-highlights.md" },
        { title: "Troubleshooting Checklist", tags: ["support", "troubleshooting"], url: "/content/ai/08-troubleshooting-checklist.md" },
      ];

      // Fetch actual content
      const docsWithContent = await Promise.all(
        sampleDocs.map(async (doc) => {
          try {
            const response = await fetch(doc.url);
            const text = await response.text();
            return { ...doc, text, source: "content-ai" };
          } catch (e) {
            return { ...doc, text: `Placeholder content for ${doc.title}`, source: "content-ai" };
          }
        })
      );

      const result = await norahIngest("content-ai", docsWithContent);
      toast({ title: "✅ Ingest Complete", description: `Inserted ${result.inserted} documents` });
      loadKpis();
    } catch (error: any) {
      const msg = error.message.includes("404") ? "Function not deployed - check Supabase" : error.message;
      toast({ title: "❌ Ingest Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleEmbed = async () => {
    setLoading("embed");
    try {
      const result = await norahEmbed({ reembed: false, batch: 200 });
      toast({ title: "✅ Embedding Complete", description: `Generated ${result.embedded} embeddings` });
      loadKpis();
    } catch (error: any) {
      const msg = error.message.includes("404") ? "Function not deployed - check Supabase" : error.message;
      toast({ title: "❌ Embedding Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading("search");
    try {
      const result = await norahSearch(searchQuery, 8, 0.1);
      setSearchResults(result.hits || []);
      toast({ title: "✅ Search Complete", description: `Found ${result.hits?.length || 0} results` });
    } catch (error: any) {
      const msg = error.message.includes("404") ? "Function not deployed - check Supabase" : error.message;
      toast({ title: "❌ Search Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const loadKpis = async () => {
    setLoading("kpis");
    try {
      const result = await norahKpis();
      setKpis(result);
    } catch (error: any) {
      const msg = error.message.includes("404") ? "Function not deployed - check Supabase" : error.message;
      toast({ title: "❌ KPIs Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const runEdgeDiag = async () => {
    setLoading("diag");
    const fns = ['norah-ingest', 'norah-embed', 'norah-rag-search', 'norah-kpis'];
    const results: Record<string, any> = {};
    for (const fn of fns) {
      const result = await verifyEdgeFunction(fn);
      results[fn] = result;
    }
    setEdgeDiag(results);
    setLoading(null);
    
    // Show toast with summary
    const allOk = Object.values(results).every((v: any) => v.ok === true);
    toast({
      title: allOk ? "✅ All Functions Reachable" : "⚠️ Some Functions Missing",
      description: allOk ? "All edge functions are deployed" : "Check the diagnostics panel below",
      variant: allOk ? "default" : "destructive"
    });
  };

  const hasNoProjectRef = functionsBaseUrl().includes('__NO_PROJECT_REF__');

  const needsEmbedding = kpis && kpis.docs_count > kpis.chunks_count;

  // Run edge diagnostics on mount
  useEffect(() => {
    runEdgeDiag();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Norah Admin
            </h1>
            <p className="text-sm text-muted-foreground font-rajdhani">RAG Search Pipeline Management</p>
          </div>
        </div>

        {/* Edge Function Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <Network className="w-5 h-5" />
              Edge Function Status
            </CardTitle>
            <CardDescription>Verify Supabase edge function deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hasNoProjectRef && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-sm text-destructive font-semibold">⚠️ No project ref detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_REF/VITE_SUPABASE_FUNCTIONS_URL in build env
                  </p>
                </div>
              )}
              
              <Button onClick={runEdgeDiag} disabled={loading === "diag"} variant="outline" size="sm">
                {loading === "diag" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                🔍 Verify Functions
              </Button>
              {Object.keys(edgeDiag).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {Object.entries(edgeDiag).map(([fn, result]: [string, any]) => {
                    const statusText = result.ok 
                      ? '✅ reachable' 
                      : result.status === 404 
                        ? '❌ 404 (not deployed)' 
                        : result.status === 403 || result.status === 401 
                          ? '⚠️ auth/CORS' 
                          : `⚠️ ${result.reason || result.status}`;
                    
                    return (
                      <div key={fn} className="flex items-center justify-between p-2 rounded bg-muted text-sm">
                        <code className="text-xs">{fn}</code>
                        <span className={result.ok ? 'text-green-500' : 'text-red-500'}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ingest Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Database className="w-5 h-5" />
                Ingest Content
              </CardTitle>
              <CardDescription>Import documents into the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleIngest} disabled={loading === "ingest"} className="w-full">
                {loading === "ingest" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Run Ingest
              </Button>
            </CardContent>
          </Card>

          {/* Embed Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Brain className="w-5 h-5" />
                Generate Embeddings
                {needsEmbedding && <Badge variant="destructive">Needs Embedding</Badge>}
              </CardTitle>
              <CardDescription>Create vector embeddings for search</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleEmbed} disabled={loading === "embed"} className="w-full">
                {loading === "embed" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Run Embedding
              </Button>
            </CardContent>
          </Card>

          {/* Search Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Search className="w-5 h-5" />
                RAG Search Test
              </CardTitle>
              <CardDescription>Test semantic search functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search query..."
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading === "search"}>
                  {loading === "search" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{result.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.chunkText || result.chunk_text}</p>
                        </div>
                        <Badge variant="secondary">{((result.similarity || 0) * 100).toFixed(1)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* KPIs Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Activity className="w-5 h-5" />
                KPI Dashboard
              </CardTitle>
              <CardDescription>System health and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={loadKpis} disabled={loading === "kpis"} variant="outline">
                  {loading === "kpis" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Refresh KPIs
                </Button>
              </div>
              {kpis ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Documents</p>
                    <p className="text-2xl font-bold font-orbitron">{kpis.docs_count || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Embeddings</p>
                    <p className="text-2xl font-bold font-orbitron">{kpis.chunks_count || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Last Embed</p>
                    <p className="text-sm font-semibold">
                      {kpis.last_embed_at ? new Date(kpis.last_embed_at).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Avg Score@5</p>
                    <p className="text-2xl font-bold font-orbitron">{kpis.avgScore ? (kpis.avgScore * 100).toFixed(1) + "%" : "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">Click "Refresh KPIs" to load metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
