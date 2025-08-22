// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Diagnostic Report - Final Analysis

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosticData {
  timestamp: string;
  userTokens: number;
  adminLogsCount: number;
  edgeFunctionStatus: 'accessible' | 'error' | 'unknown';
  serviceWorkerActive: boolean;
  fcmSupported: boolean;
  lastNotificationSent: string | null;
  recommendedActions: string[];
  criticalIssues: string[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
}

export const FCMDiagnosticReport = () => {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      console.log('🔥 FCM-TRACE: Generating comprehensive diagnostic report...');
      
      // Check user authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // 1. Check FCM tokens in database
      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('is_active', true);

      // 2. Check recent admin logs for Firebase activity
      const { data: logs } = await supabase
        .from('admin_logs')
        .select('*')
        .or('event_type.ilike.%firebase%,note.ilike.%firebase%,note.ilike.%FCM%')
        .order('created_at', { ascending: false })
        .limit(20);

      // 3. Test edge function accessibility
      let edgeFunctionStatus: 'accessible' | 'error' | 'unknown' = 'unknown';
      try {
        const { error } = await supabase.functions.invoke('send-firebase-push', {
          body: { test: true }
        });
        edgeFunctionStatus = error ? 'error' : 'accessible';
      } catch {
        edgeFunctionStatus = 'error';
      }

      // 4. Check service worker status
      let serviceWorkerActive = false;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        serviceWorkerActive = !!registration?.active;
      } catch {
        serviceWorkerActive = false;
      }

      // 5. Check FCM support
      const fcmSupported = 'serviceWorker' in navigator && 
                          'Notification' in window && 
                          'PushManager' in window;

      // 6. Find last notification
      const lastNotificationLog = logs?.find(log => 
        log.note?.toLowerCase().includes('notif') || 
        log.event_type?.toLowerCase().includes('push')
      );

      // Analyze and generate recommendations
      const recommendedActions: string[] = [];
      const criticalIssues: string[] = [];

      if (!tokens || tokens.length === 0) {
        criticalIssues.push('❌ CRITICO: Nessun token FCM salvato nel database');
        recommendedActions.push('Attivare le notifiche push per salvare almeno un token');
      }

      if (!fcmSupported) {
        criticalIssues.push('❌ CRITICO: Browser non supporta FCM');
        recommendedActions.push('Usare browser compatibile (Chrome, Firefox, Safari 16.4+)');
      }

      if (!serviceWorkerActive) {
        criticalIssues.push('❌ CRITICO: Service Worker non attivo');
        recommendedActions.push('Verificare registrazione service worker in /firebase-messaging-sw.js');
      }

      if (edgeFunctionStatus === 'error') {
        criticalIssues.push('❌ CRITICO: Edge Function send-firebase-push non accessibile');
        recommendedActions.push('Controllare deployment della Edge Function');
      }

      if (Notification.permission !== 'granted') {
        criticalIssues.push('⚠️ ATTENZIONE: Permessi notifiche non concessi');
        recommendedActions.push('Richiedere permessi notifiche all\'utente');
      }

      if (!logs || logs.length === 0) {
        recommendedActions.push('Testare invio notifica per generare log di debug');
      }

      // Determine overall health
      let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (criticalIssues.length > 0) {
        overallHealth = criticalIssues.some(issue => issue.includes('CRITICO')) ? 'critical' : 'degraded';
      }

      const diagnosticData: DiagnosticData = {
        timestamp: new Date().toISOString(),
        userTokens: tokens?.length || 0,
        adminLogsCount: logs?.length || 0,
        edgeFunctionStatus,
        serviceWorkerActive,
        fcmSupported,
        lastNotificationSent: lastNotificationLog?.created_at || null,
        recommendedActions,
        criticalIssues,
        overallHealth
      };

      setDiagnosticData(diagnosticData);
      setLastRefresh(new Date().toLocaleString());

      // Log report generation
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_diagnostic_report_generated',
          user_id: user.id,
          note: `FCM diagnostic report: ${overallHealth} status, ${criticalIssues.length} critical issues`,
          context: 'firebase_diagnostics'
        });

      console.log('✅ FCM-TRACE: Diagnostic report generated:', diagnosticData);
      toast.success('Report diagnostico generato');

    } catch (error: any) {
      console.error('❌ FCM-TRACE: Report generation failed:', error);
      toast.error(`Errore generazione report: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getHealthColor = (health: DiagnosticData['overallHealth']) => {
    switch (health) {
      case 'healthy': return 'border-green-200 bg-green-50';
      case 'degraded': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getHealthIcon = (health: DiagnosticData['overallHealth']) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          📊 M1SSION™ FCM Diagnostic Report
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateReport}
            disabled={isGeneratingReport}
          >
            <RefreshCw className={`h-4 w-4 ${isGeneratingReport ? 'animate-spin' : ''}`} />
            {isGeneratingReport ? 'Generating...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {diagnosticData ? (
          <>
            {/* Overall Health Status */}
            <Alert className={`border-2 ${getHealthColor(diagnosticData.overallHealth)}`}>
              <AlertDescription>
                <div className="flex items-center gap-3">
                  {getHealthIcon(diagnosticData.overallHealth)}
                  <div>
                    <div className="font-semibold text-lg">
                      Status Sistema: {diagnosticData.overallHealth.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Report generato: {new Date(diagnosticData.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{diagnosticData.userTokens}</div>
                <div className="text-sm text-muted-foreground">FCM Tokens Attivi</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{diagnosticData.adminLogsCount}</div>
                <div className="text-sm text-muted-foreground">Log Firebase</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {diagnosticData.edgeFunctionStatus === 'accessible' ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">Edge Function</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {diagnosticData.serviceWorkerActive ? '✅' : '❌'}
                </div>
                <div className="text-sm text-muted-foreground">Service Worker</div>
              </div>
            </div>

            {/* Critical Issues */}
            {diagnosticData.criticalIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">🚨 Problemi Critici</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticData.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions */}
            {diagnosticData.recommendedActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">🎯 Azioni Consigliate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticData.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>🔧 Dettagli Tecnici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>FCM Support:</strong> 
                    <Badge className="ml-2" variant={diagnosticData.fcmSupported ? 'default' : 'destructive'}>
                      {diagnosticData.fcmSupported ? 'Supportato' : 'Non Supportato'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Edge Function:</strong>
                    <Badge className="ml-2" variant={diagnosticData.edgeFunctionStatus === 'accessible' ? 'default' : 'destructive'}>
                      {diagnosticData.edgeFunctionStatus}
                    </Badge>
                  </div>
                  <div>
                    <strong>Service Worker:</strong>
                    <Badge className="ml-2" variant={diagnosticData.serviceWorkerActive ? 'default' : 'destructive'}>
                      {diagnosticData.serviceWorkerActive ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </div>
                  <div>
                    <strong>Ultima Notifica:</strong>
                    <span className="ml-2 text-muted-foreground">
                      {diagnosticData.lastNotificationSent ? 
                        new Date(diagnosticData.lastNotificationSent).toLocaleDateString() : 
                        'Nessuna'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Alert>
              <AlertDescription>
                <div className="font-semibold mb-2">📝 Riepilogo Diagnostica FCM:</div>
                <div className="text-sm space-y-1">
                  <div>• {diagnosticData.userTokens} token FCM trovati nel database</div>
                  <div>• Edge Function: {diagnosticData.edgeFunctionStatus}</div>
                  <div>• Service Worker: {diagnosticData.serviceWorkerActive ? 'attivo' : 'non attivo'}</div>
                  <div>• Browser FCM Support: {diagnosticData.fcmSupported ? 'sì' : 'no'}</div>
                  <div>• Problemi critici: {diagnosticData.criticalIssues.length}</div>
                  <div>• Azioni consigliate: {diagnosticData.recommendedActions.length}</div>
                </div>
              </AlertDescription>
            </Alert>

            {lastRefresh && (
              <div className="text-xs text-muted-foreground text-center">
                Ultimo aggiornamento: {lastRefresh}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {isGeneratingReport ? 'Generazione report in corso...' : 'Nessun report disponibile'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};