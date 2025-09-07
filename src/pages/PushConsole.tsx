import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Send, Users, User, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PushConsole() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [target, setTarget] = useState<"all" | "csv">("all");
  const [userIdsCsv, setUserIdsCsv] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "no-session" | "forbidden" | "authorized">("loading");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setAuthState("no-session");
          return;
        }

        const userId = sessionData.session.user.id;
        setCurrentUserId(userId);

        // Check if user is in admin allowlist (using single UUID)
        const adminIds = "495246c1-9154-4f01-a428-7f37fe230180";
        const adminList = adminIds.split(",").map((id: string) => id.trim()).filter(Boolean);
        
        if (!adminList.includes(userId)) {
          setAuthState("forbidden");
          return;
        }

        setAuthState("authorized");
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState("forbidden");
      }
    };

    checkAuth();
  }, []);

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and Body are required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const targetPayload = target === "all" 
        ? { all: true }
        : { user_ids_csv: userIdsCsv.trim() };

      const payload = {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || "/",
        target: targetPayload
      };

      console.log("📤 Sending admin broadcast:", payload);

      const projectRef = "vkjrqirvdvjbemsfzxof"; // Your project ref
      const response = await fetch(`https://${projectRef}.functions.supabase.co/webpush-admin-broadcast`, {
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

      if (response.ok && json.success !== false) {
        toast.success(`✅ Push sent: ${json.success}/${json.total} successful`);
      } else {
        if (response.status === 403) {
          toast.error("❌ Accesso non autorizzato: aggiungi l'UUID all'elenco ADMIN_USER_IDS");
        } else {
          toast.error(`❌ Error: ${json.error || 'Unknown error'}`);
        }
      }

    } catch (error: any) {
      console.error("Push broadcast error:", error);
      toast.error(`Network error: ${error.message}`);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Checking authorization...</span>
      </div>
    );
  }

  if (authState === "no-session") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Sign-in required. Please authenticate to access the Push Console.
        </AlertDescription>
      </Alert>
    );
  }

  if (authState === "forbidden") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Accesso non autorizzato: aggiungi l'UUID all'elenco ADMIN_USER_IDS.
          {currentUserId && (
            <div className="mt-2 text-xs opacity-70">
              Current user ID: {currentUserId}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Admin Push Console
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
              placeholder="e.g. M1SSION™ Update"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message..."
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
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
            <RadioGroup value={target} onValueChange={(value: "all" | "csv") => setTarget(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  All users
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Specific User IDs (CSV)
                </Label>
              </div>
            </RadioGroup>

            {target === "csv" && (
              <div className="space-y-2">
                <Label htmlFor="userIds">User IDs (comma separated)</Label>
                <Textarea
                  id="userIds"
                  value={userIdsCsv}
                  onChange={(e) => setUserIdsCsv(e.target.value)}
                  placeholder="uuid1, uuid2, uuid3..."
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={sendNotification} 
            disabled={loading || !title.trim() || !body.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
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
            <Label>Result</Label>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-[300px] text-muted-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PushConsole;