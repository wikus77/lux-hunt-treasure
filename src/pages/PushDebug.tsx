// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Notifications Debug Panel - Admin Only

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, RefreshCw, Shield, CheckCircle, XCircle } from "lucide-react";

interface PushStats {
  activeTokens: number;
  totalLogs: number;
  successRate: number;
  recentLogs: Array<{
    id: string;
    status: string;
    created_at: string;
    error_message?: string;
    payload: any;
  }>;
}

export default function PushDebug() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<PushStats | null>(null);
  const [testTitle, setTestTitle] = useState("Test M1SSION™");
  const [testBody, setTestBody] = useState("Questa è una notifica di test");
  const [testUrl, setTestUrl] = useState("/home");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkAdminAndLoadStats();
  }, []);

  const checkAdminAndLoadStats = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "Accesso Negato",
          description: "Solo gli admin possono accedere a questa pagina",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadStats();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get active tokens count
      const { count: activeCount } = await supabase
        .from("push_tokens")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get recent logs
      const { data: logs } = await supabase
        .from("push_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Calculate success rate
      const { count: successCount } = await supabase
        .from("push_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "success");

      const { count: totalCount } = await supabase
        .from("push_logs")
        .select("*", { count: "exact", head: true });

      const successRate = totalCount && successCount 
        ? Math.round((successCount / totalCount) * 100)
        : 0;

      setStats({
        activeTokens: activeCount || 0,
        totalLogs: totalCount || 0,
        successRate,
        recentLogs: logs || []
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("send-web-push", {
        body: {
          user_ids: [user.id],
          payload: {
            title: testTitle,
            body: testBody,
            url: testUrl
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Notifica Inviata",
        description: `Inviata a ${data.sent} dispositivi`
      });

      // Reload stats after sending
      await loadStats();
    } catch (error) {
      console.error("Error sending test:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Invio fallito",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Push Debug Panel</h1>
            <p className="text-muted-foreground">Diagnostica Web Push - Admin Only</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Token Attivi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">{stats?.activeTokens || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold">{stats?.successRate || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Totale Invii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">{stats?.totalLogs || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Notification */}
        <Card>
          <CardHeader>
            <CardTitle>Invia Notifica Test</CardTitle>
            <CardDescription>
              Invia una notifica di test al tuo dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo</Label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Titolo notifica"
              />
            </div>
            <div className="space-y-2">
              <Label>Messaggio</Label>
              <Textarea
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="Corpo del messaggio"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>URL (opzionale)</Label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="/home"
              />
            </div>
            <Button
              onClick={sendTestNotification}
              disabled={sending || !testTitle || !testBody}
              className="w-full"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Invio...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invia Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ultimi Invii</CardTitle>
              <CardDescription>Log delle ultime 10 notifiche</CardDescription>
            </div>
            <Button
              onClick={loadStats}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {log.status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {log.payload?.title || "No title"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.payload?.body || "No body"}
                      </p>
                      {log.error_message && (
                        <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleString("it-IT")}
                  </span>
                </div>
              ))}
              {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nessun log disponibile
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
