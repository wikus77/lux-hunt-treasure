// © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Admin Panel
import { useState, useEffect } from "react";
import { Brain, Upload, TestTube, Clock, Activity, BarChart, Zap } from "lucide-react";
import NorahE2ETest from "@/features/norah/NorahE2ETest";
import ContentSources from "@/features/norah/ContentSources";
import BulkIngest from "@/features/norah/BulkIngest";
import EvalHarness from "@/features/norah/EvalHarness";
import Scheduler from "@/features/norah/Scheduler";
import KPIPanel from "@/features/norah/KPIPanel";
import IntelligenceActivation from "@/features/norah/IntelligenceActivation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { norahKpis } from "@/lib/norah/api";
import { useNorahStore } from "@/lib/norah/store";

export default function NorahAdmin() {
  const [kpis, setKpis] = useState<any>(null);

  const loadKpis = async () => {
    try {
      const result = await norahKpis();
      setKpis(result);
    } catch (error) {
      console.error('Failed to load KPIs:', error);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Norah AI 2.0
              </h1>
              <p className="text-sm text-muted-foreground font-rajdhani">Intelligent Knowledge Base • ≥200 docs target</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-orbitron">
            KB: {kpis?.docs_count || 0} docs • {kpis?.chunks_count || 0} embeddings
          </Badge>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="activation" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="activation">
              <Zap className="w-4 h-4 mr-2" />
              Activation
            </TabsTrigger>
            <TabsTrigger value="sources">
              <Upload className="w-4 h-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="ingest">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Ingest
            </TabsTrigger>
            <TabsTrigger value="eval">
              <TestTube className="w-4 h-4 mr-2" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="scheduler">
              <Clock className="w-4 h-4 mr-2" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="kpi">
              <BarChart className="w-4 h-4 mr-2" />
              KPIs
            </TabsTrigger>
            <TabsTrigger value="legacy">
              <Activity className="w-4 h-4 mr-2" />
              E2E Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activation" className="space-y-4">
            <IntelligenceActivation />
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <ContentSources />
          </TabsContent>

          <TabsContent value="ingest" className="space-y-4">
            <BulkIngest onComplete={loadKpis} />
          </TabsContent>

          <TabsContent value="eval" className="space-y-4">
            <EvalHarness />
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-4">
            <Scheduler onTrigger={loadKpis} />
          </TabsContent>

          <TabsContent value="kpi" className="space-y-4">
            <KPIPanel />
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            {import.meta.env.DEV && <NorahE2ETest />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
