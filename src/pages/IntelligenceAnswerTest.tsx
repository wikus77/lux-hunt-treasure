import { useState } from "react";
import { ragAnswer } from "@/api/rag";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function IntelligenceAnswerTest() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Array<{ title: string; doc_id: string; chunk_idx: number; snippet: string }>>([]);
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({ title: "Errore", description: "Inserisci una domanda", variant: "destructive" });
      return;
    }

    setLoading(true);
    setAnswer("");
    setSources([]);
    setProvider("");

    try {
      const result = await ragAnswer(query);
      setAnswer(result.answer);
      setSources(result.sources);
      setProvider(result.provider);
    } catch (error) {
      console.error("ragAnswer error:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la richiesta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Spiegami BUZZ e quando conviene usare BUZZ Map",
    "Differenze tra piani Free e Titanium su BUZZ e BUZZ Map",
    "Sono su Silver e ho 30 secondi: qual è la next best action?",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Norah AI Answer Test</h1>
        <p className="text-muted-foreground">
          Test della pipeline RAG → LLM con risposta contestuale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fai una domanda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Es: Spiegami BUZZ e quando usare BUZZ Map"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {examples.map((ex, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(ex)}
                    disabled={loading}
                  >
                    {ex.slice(0, 30)}...
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Elaborazione..." : "Chiedi a Norah"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {answer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Risposta</span>
              <span className="text-sm font-normal text-muted-foreground">
                Provider: {provider}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={answer}
              readOnly
              className="min-h-[200px] font-sans"
            />
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fonti ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg bg-muted/30 space-y-1"
                >
                  <div className="font-semibold text-sm">
                    {src.title} #{src.chunk_idx}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {src.doc_id}
                  </div>
                  <div className="text-sm italic">"{src.snippet}..."</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
