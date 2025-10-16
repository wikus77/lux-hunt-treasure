// © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Intelligence Activation System
import { useState } from "react";
import { Brain, Play, CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateM1SSIONKnowledgeBase } from "@/lib/norah/m1ssionDocGenerator";
import { useNorahStore } from "@/lib/norah/store";
import { norahIngest, norahEmbed, norahKpis, norahSearch } from "@/lib/norah/api";
import { INTELLIGENCE_EVAL_QUESTIONS } from "@/lib/norah/intelligenceEval";

interface StepResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  progress: number;
  message: string;
  data?: any;
}

interface FinalReport {
  timestamp: string;
  execution_time_seconds: number;
  steps: StepResult[];
  knowledge_base: {
    total_docs: number;
    total_embeddings: number;
    target_docs: number;
    completion_percentage: number;
  };
  intelligence_metrics: {
    pass_at_1: number;
    pass_at_3: number;
    avg_similarity: number;
    contextual_reasoning: number;
    semantic_depth: number;
    cross_module_understanding: number;
  };
  scheduler_status: {
    enabled: boolean;
    next_crawl: string;
    next_embed: string;
  };
  cross_query_validation: {
    total_queries: number;
    successful_queries: number;
    success_rate: number;
  };
  intelligence_gain_percentage: number;
  overall_performance_percentage: number;
  verdict: 'SMARTER ✅' | 'SAME ⚠️' | 'REGRESSION ❌';
  recommendations: string[];
}

export default function IntelligenceActivation() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [steps, setSteps] = useState<StepResult[]>([
    { name: "Knowledge Base Generation", status: 'pending', progress: 0, message: 'Waiting...' },
    { name: "Document Ingestion", status: 'pending', progress: 0, message: 'Waiting...' },
    { name: "Vector Embedding", status: 'pending', progress: 0, message: 'Waiting...' },
    { name: "Intelligence Evaluation", status: 'pending', progress: 0, message: 'Waiting...' },
    { name: "Cross-Query Validation", status: 'pending', progress: 0, message: 'Waiting...' },
    { name: "Final Report Generation", status: 'pending', progress: 0, message: 'Waiting...' },
  ]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const { setSelectedDocs } = useNorahStore();

  const updateStep = (index: number, updates: Partial<StepResult>) => {
    setSteps(prev => prev.map((step, i) => i === index ? { ...step, ...updates } : step));
  };

  const runFullActivation = async () => {
    setIsRunning(true);
    setStartTime(Date.now());
    const results: any = {};

    try {
      // STEP 1: Generate Knowledge Base (≥200 docs)
      updateStep(0, { status: 'running', progress: 10, message: 'Generating M1SSION™ documents...' });
      const generatedDocs = generateM1SSIONKnowledgeBase();
      results.generatedDocs = generatedDocs.length;
      updateStep(0, { status: 'running', progress: 50, message: `Generated ${generatedDocs.length} documents` });
      
      // Convert to enriched format
      const enrichedDocs = generatedDocs.map((doc, idx) => ({
        ...doc,
        summary: doc.text.substring(0, 200) + '...',
        autoTags: doc.tags || [],
        dedupeKey: `${doc.title}-${idx}`,
        chunks: [{ idx: 0, text: doc.text }],
      }));
      
      setSelectedDocs(enrichedDocs);
      updateStep(0, { status: 'success', progress: 100, message: `✅ ${generatedDocs.length} docs generated`, data: { count: generatedDocs.length } });

      // STEP 2: Ingest Documents (with batching to prevent payload too large)
      updateStep(1, { status: 'running', progress: 10, message: 'Preparing documents...' });
      
      const BATCH_SIZE = 10; // Small batches to avoid timeout/payload issues
      const totalDocs = generatedDocs.length;
      let totalInserted = 0;
      let batchErrors = 0;
      
      const docsToIngest = generatedDocs.map(doc => ({
        title: doc.title,
        text: doc.text,
        tags: doc.tags,
        source: doc.source,
        url: doc.url,
      }));
      
      // Process in batches
      for (let i = 0; i < docsToIngest.length; i += BATCH_SIZE) {
        const batch = docsToIngest.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalDocs / BATCH_SIZE);
        
        updateStep(1, { 
          status: 'running', 
          progress: 10 + (i / totalDocs * 80), 
          message: `Ingesting batch ${batchNum}/${totalBatches} (${batch.length} docs)...` 
        });
        
        // Micro-pacing between batches in preview
        if (i > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Retry logic for each batch
        let batchSuccess = false;
        let retryCount = 0;
        const MAX_RETRIES = 2;
        let batchError: any = null;
        
        while (!batchSuccess && retryCount <= MAX_RETRIES) {
          try {
            const batchResult = await norahIngest({ documents: batch, dryRun: false });
            totalInserted += batchResult.inserted || 0;
            batchSuccess = true;
          } catch (error: any) {
            batchError = error;
            retryCount++;
            if (retryCount > MAX_RETRIES) {
              console.error(`Batch ${batchNum} failed after ${MAX_RETRIES} retries:`, error?.message || error);
              batchErrors++;
              break;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      results.ingestResult = { inserted: totalInserted, errors: batchErrors };
      
      if (batchErrors > 0) {
        updateStep(1, { 
          status: 'success', 
          progress: 100, 
          message: `⚠️ ${totalInserted} docs ingested, ${batchErrors} batches failed`, 
          data: { inserted: totalInserted, errors: batchErrors } 
        });
      } else {
        updateStep(1, { 
          status: 'success', 
          progress: 100, 
          message: `✅ ${totalInserted} docs ingested successfully`, 
          data: { inserted: totalInserted } 
        });
      }

      // STEP 3: Embed Vectors
      updateStep(2, { status: 'running', progress: 10, message: 'Generating embeddings...' });
      let totalEmbedded = 0;
      let remaining = 1;
      let embedRound = 0;
      
      while (remaining > 0) {
        // Micro-pacing between embed batches in preview
        if (embedRound > 0 && (import.meta.env.MODE === 'development' || window.location.hostname.includes('lovable'))) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const embedResult = await norahEmbed({ batch: 200, reembed: false });
        totalEmbedded += embedResult.embedded || 0;
        remaining = embedResult.remaining || 0;
        updateStep(2, { status: 'running', progress: 50, message: `Embedded ${totalEmbedded} chunks, ${remaining} remaining...` });
        embedRound++;
      }
      
      results.totalEmbedded = totalEmbedded;
      updateStep(2, { status: 'success', progress: 100, message: `✅ ${totalEmbedded} embeddings created`, data: { embedded: totalEmbedded } });

      // Get KPIs after embedding
      const kpis = await norahKpis();
      results.kpis = kpis;

      // STEP 4: Intelligence Evaluation (30 questions)
      updateStep(3, { status: 'running', progress: 10, message: 'Running intelligence tests...' });
      const evalResults = await runIntelligenceEvaluation();
      results.evalResults = evalResults;
      updateStep(3, { 
        status: 'success', 
        progress: 100, 
        message: `✅ Pass@1: ${(evalResults.pass_at_1 * 100).toFixed(1)}%, Pass@3: ${(evalResults.pass_at_3 * 100).toFixed(1)}%`,
        data: evalResults,
      });

      // STEP 5: Cross-Query Validation
      updateStep(4, { status: 'running', progress: 10, message: 'Testing cross-module queries...' });
      const crossQueryResults = await runCrossQueryValidation();
      results.crossQueryResults = crossQueryResults;
      updateStep(4, { 
        status: 'success', 
        progress: 100, 
        message: `✅ ${crossQueryResults.successful}/${crossQueryResults.total} queries successful`,
        data: crossQueryResults,
      });

      // STEP 6: Generate Final Report
      updateStep(5, { status: 'running', progress: 10, message: 'Generating final report...' });
      const report = generateFinalReport(results, Date.now() - startTime);
      setFinalReport(report);
      updateStep(5, { status: 'success', progress: 100, message: `✅ Report generated: ${report.verdict}`, data: report });

      toast.success(`🧠 Norah AI 2.0 Activation Complete: ${report.verdict}`, {
        description: `Overall Performance: ${report.overall_performance_percentage}%`,
      });

    } catch (error: any) {
      const currentStep = steps.findIndex(s => s.status === 'running');
      if (currentStep >= 0) {
        updateStep(currentStep, { status: 'error', progress: 0, message: `❌ ${error.message}` });
      }
      toast.error('Intelligence Activation Failed', { description: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runIntelligenceEvaluation = async () => {
    const questions = INTELLIGENCE_EVAL_QUESTIONS;
    const results = { correct_at_1: 0, correct_at_3: 0, total_similarity: 0, questions: [] as any[] };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        const response = await norahSearch({ q: q.query, top_k: 6 });
        const hits = response.hits || [];
        
        const similarityScore = hits[0]?.distance || 1.0;
        results.total_similarity += similarityScore;
        
        const top1Match = hits[0]?.chunk_text?.toLowerCase().includes(q.expected_keywords[0].toLowerCase());
        const top3Match = hits.slice(0, 3).some(h => 
          q.expected_keywords.some(k => h.chunk_text?.toLowerCase().includes(k.toLowerCase()))
        );
        
        if (top1Match) results.correct_at_1++;
        if (top3Match) results.correct_at_3++;
        
        results.questions.push({ question: q.query, top1Match, top3Match, similarity: similarityScore });
      } catch (error) {
        console.error(`Eval question ${i} failed:`, error);
      }
    }

    const pass_at_1 = results.correct_at_1 / questions.length;
    const pass_at_3 = results.correct_at_3 / questions.length;
    const avg_similarity = results.total_similarity / questions.length;

    // Calculate intelligence metrics
    const contextual_reasoning = Math.min(10, pass_at_3 * 12);
    const semantic_depth = Math.min(10, (1 - avg_similarity) * 15);
    const cross_module_understanding = Math.min(10, pass_at_1 * 13);

    return {
      pass_at_1,
      pass_at_3,
      avg_similarity,
      contextual_reasoning,
      semantic_depth,
      cross_module_understanding,
      details: results.questions,
    };
  };

  const runCrossQueryValidation = async () => {
    const testQueries = [
      "Come il sistema BUZZ si sincronizza con Supabase Realtime?",
      "Che differenza c'è tra Push SAFE Guard e cron automatico?",
      "Come Norah AI gestisce i pattern aptici nelle notifiche?",
      "Quali regole governano il Final Shot?",
      "Come funziona l'anti-forcing nelle missioni M1SSION?",
    ];

    let successful = 0;
    for (const query of testQueries) {
      try {
        const response = await norahSearch({ q: query, top_k: 3 });
        if (response.hits && response.hits.length > 0 && response.hits[0].distance < 0.45) {
          successful++;
        }
      } catch (error) {
        console.error('Cross-query failed:', error);
      }
    }

    return { total: testQueries.length, successful, success_rate: successful / testQueries.length };
  };

  const generateFinalReport = (results: any, executionTime: number): FinalReport => {
    const kpis = results.kpis || {};
    const evalResults = results.evalResults || {};
    const crossQuery = results.crossQueryResults || {};

    const kb_completion = Math.min(100, ((kpis.documents || 0) / 200) * 100);
    const eval_score = ((evalResults.pass_at_1 || 0) * 0.3 + (evalResults.pass_at_3 || 0) * 0.3 + (1 - (evalResults.avg_similarity || 1)) * 0.2 + (crossQuery.success_rate || 0) * 0.2) * 100;
    const intelligence_gain = ((evalResults.pass_at_1 || 0) - 0.45) * 100; // baseline 45%
    
    const overall_performance = (kb_completion * 0.3 + eval_score * 0.5 + (crossQuery.success_rate || 0) * 100 * 0.2);

    let verdict: FinalReport['verdict'] = 'SAME ⚠️';
    if (overall_performance >= 90 && evalResults.pass_at_1 >= 0.65) verdict = 'SMARTER ✅';
    else if (overall_performance < 70) verdict = 'REGRESSION ❌';

    const recommendations: string[] = [];
    if (kpis.documents < 200) recommendations.push('Increase knowledge base to ≥200 documents');
    if (evalResults.pass_at_1 < 0.65) recommendations.push('Improve document quality and chunking strategy');
    if (crossQuery.success_rate < 0.8) recommendations.push('Enhance cross-module semantic linking');
    if (overall_performance >= 95) recommendations.push('🎉 Excellent! Consider production deployment');

    return {
      timestamp: new Date().toISOString(),
      execution_time_seconds: executionTime / 1000,
      steps,
      knowledge_base: {
        total_docs: kpis.documents || 0,
        total_embeddings: kpis.embeddings || 0,
        target_docs: 200,
        completion_percentage: kb_completion,
      },
      intelligence_metrics: {
        pass_at_1: evalResults.pass_at_1 || 0,
        pass_at_3: evalResults.pass_at_3 || 0,
        avg_similarity: evalResults.avg_similarity || 1,
        contextual_reasoning: evalResults.contextual_reasoning || 0,
        semantic_depth: evalResults.semantic_depth || 0,
        cross_module_understanding: evalResults.cross_module_understanding || 0,
      },
      scheduler_status: {
        enabled: false, // User can enable manually
        next_crawl: '06:00 UTC',
        next_embed: '07:00 UTC',
      },
      cross_query_validation: {
        total_queries: crossQuery.total || 0,
        successful_queries: crossQuery.successful || 0,
        success_rate: crossQuery.success_rate || 0,
      },
      intelligence_gain_percentage: intelligence_gain,
      overall_performance_percentage: overall_performance,
      verdict,
      recommendations,
    };
  };

  const exportReport = () => {
    if (!finalReport) return;
    const blob = new Blob([JSON.stringify(finalReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `norah-intelligence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const getStepIcon = (status: StepResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const overallProgress = steps.reduce((sum, step) => sum + step.progress, 0) / steps.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-orbitron">
                <Brain className="w-6 h-6" />
                🧠 NORAH AI 2.0 Intelligence Activation System
              </CardTitle>
              <CardDescription>
                Automated full-stack intelligence verification and deployment
              </CardDescription>
            </div>
            <Button
              onClick={runFullActivation}
              disabled={isRunning}
              size="lg"
              className="font-orbitron"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  🚀 Start Full Activation
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-semibold">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Step-by-Step Progress */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-0.5">{getStepIcon(step.status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{step.name}</span>
                    <Badge variant={step.status === 'success' ? 'default' : 'secondary'}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.message}</p>
                  {step.status === 'running' && (
                    <Progress value={step.progress} className="h-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Report */}
      {finalReport && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-orbitron text-2xl">
                🧠 NORAH AI 2.0 — FINAL INTELLIGENCE REPORT
              </CardTitle>
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verdict */}
            <div className="text-center p-6 rounded-lg bg-primary/10">
              <h2 className="text-3xl font-orbitron font-bold mb-2">{finalReport.verdict}</h2>
              <p className="text-xl font-semibold text-primary">
                Overall Performance: {finalReport.overall_performance_percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Execution Time: {finalReport.execution_time_seconds.toFixed(2)}s
              </p>
            </div>

            {/* Knowledge Base Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{finalReport.knowledge_base.total_docs}</p>
                <p className="text-xs text-muted-foreground">Target: {finalReport.knowledge_base.target_docs}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Embeddings</p>
                <p className="text-2xl font-bold">{finalReport.knowledge_base.total_embeddings}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">KB Completion</p>
                <p className="text-2xl font-bold">{finalReport.knowledge_base.completion_percentage.toFixed(1)}%</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Intelligence Gain</p>
                <p className="text-2xl font-bold text-green-500">+{finalReport.intelligence_gain_percentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Intelligence Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Intelligence Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pass@1</span>
                    <span className="font-semibold">{(finalReport.intelligence_metrics.pass_at_1 * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={finalReport.intelligence_metrics.pass_at_1 * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pass@3</span>
                    <span className="font-semibold">{(finalReport.intelligence_metrics.pass_at_3 * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={finalReport.intelligence_metrics.pass_at_3 * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Contextual Reasoning</span>
                    <span className="font-semibold">{finalReport.intelligence_metrics.contextual_reasoning.toFixed(1)}/10</span>
                  </div>
                  <Progress value={finalReport.intelligence_metrics.contextual_reasoning * 10} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Semantic Depth</span>
                    <span className="font-semibold">{finalReport.intelligence_metrics.semantic_depth.toFixed(1)}/10</span>
                  </div>
                  <Progress value={finalReport.intelligence_metrics.semantic_depth * 10} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cross-Module Understanding</span>
                    <span className="font-semibold">{finalReport.intelligence_metrics.cross_module_understanding.toFixed(1)}/10</span>
                  </div>
                  <Progress value={finalReport.intelligence_metrics.cross_module_understanding * 10} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cross-Query Success</span>
                    <span className="font-semibold">{(finalReport.cross_query_validation.success_rate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={finalReport.cross_query_validation.success_rate * 100} />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {finalReport.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {finalReport.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
