// © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 KPI Panel
import { useState, useEffect } from "react";
import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { norahKpis, downloadKPIs } from "@/lib/norah/api";
import { toast } from "sonner";

export default function KPIPanel() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadKPIs = async () => {
    setLoading(true);
    try {
      const data = await norahKpis();
      setKpis(data);
      toast.success("KPIs refreshed");
    } catch (error: any) {
      toast.error(`Failed to load KPIs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await downloadKPIs();
      toast.success("KPIs exported as JSON");
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Norah AI KPIs
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadKPIs} disabled={loading} size="sm">
              Refresh
            </Button>
            <Button onClick={handleExport} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {kpis ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Documents</p>
                <Badge variant="secondary" className="text-lg">
                  {kpis.documents || 0}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Embeddings</p>
                <Badge variant="secondary" className="text-lg">
                  {kpis.embeddings || 0}
                </Badge>
              </div>
            </div>
            {kpis.last_embed_at && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Embed</p>
                <p className="text-sm font-mono">{new Date(kpis.last_embed_at).toLocaleString()}</p>
              </div>
            )}
            {kpis.ok === false && (
              <p className="text-sm text-destructive">⚠️ Backend health check failed</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading KPIs...</p>
        )}
      </CardContent>
    </Card>
  );
}
