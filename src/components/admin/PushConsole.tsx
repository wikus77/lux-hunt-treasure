import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Send, Users, User, Loader2 } from "lucide-react";

const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
const FUNCS_URL = `${SUPABASE_URL}/functions/v1`;

export function PushConsole() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [mode, setMode] = useState<"all" | "list">("all");
  const [idsCsv, setIdsCsv] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title e Body sono obbligatori");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      
      if (!token) {
        toast.error("Devi essere autenticato");
        setLoading(false);
        return;
      }

      const user_ids = mode === "list"
        ? idsCsv.split(",").map(s => s.trim()).filter(Boolean)
        : undefined;

      const payload = {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || "/",
        user_ids,
      };

      console.log("📤 Sending push broadcast:", payload);

      const response = await fetch(`${FUNCS_URL}/push-broadcast`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));
      const resultData = { status: response.status, ...json };
      
      setResult(resultData);

      if (response.ok && json.success) {
        toast.success(`✅ Push inviati: ${json.sent}/${json.requested}`);
      } else {
        toast.error(`❌ Errore: ${json.error || 'Unknown error'}`);
      }

    } catch (error: any) {
      console.error("Push broadcast error:", error);
      toast.error(`Errore di rete: ${error.message}`);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Push Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. M1SSION™ Update"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Testo della notifica..."
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (opzionale)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label>Target</Label>
            <RadioGroup value={mode} onValueChange={(value: "all" | "list") => setMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Tutti gli utenti
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="list" id="list" />
                <Label htmlFor="list" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  User IDs specifici (CSV)
                </Label>
              </div>
            </RadioGroup>

            {mode === "list" && (
              <div className="space-y-2">
                <Label htmlFor="userIds">User IDs (separati da virgola)</Label>
                <Textarea
                  id="userIds"
                  value={idsCsv}
                  onChange={(e) => setIdsCsv(e.target.value)}
                  placeholder="uuid1, uuid2, uuid3..."
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={send} 
            disabled={loading || !title.trim() || !body.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <Label>Risultato</Label>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-[300px] text-muted-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}