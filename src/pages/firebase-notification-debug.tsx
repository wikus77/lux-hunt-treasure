// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FCMDebugTrace } from '@/components/admin/FCMDebugTrace';
import { M1ssionFirebasePushTestPanel } from '@/components/admin/M1ssionFirebasePushTestPanel';
import { FirebaseNotificationDiagnostic } from '@/components/admin/FirebaseNotificationDiagnostic';
import { FirebaseNotificationReport } from '@/components/admin/FirebaseNotificationReport';
import { FCMComprehensiveTest } from '@/components/admin/FCMComprehensiveTest';
import { FCMDiagnosticReport } from '@/components/admin/FCMDiagnosticReport';
import { Badge } from '@/components/ui/badge';

export default function FirebaseNotificationDebug() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              🔥 M1SSION™ Firebase FCM Debug Panel
              <Badge variant="outline" className="bg-primary/10">
                Advanced Diagnostics
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Strumenti avanzati per diagnosticare e testare il sistema Firebase Cloud Messaging.
              Questo pannello ti aiuta a identificare problemi con token, permessi, service worker e notifiche push.
            </p>
          </CardContent>
        </Card>

        {/* Executive Summary Report */}
        <FCMDiagnosticReport />

        {/* Comprehensive Test Suite - Priority */}
        <FCMComprehensiveTest />

        {/* FCM Real-time Diagnostics */}
        <FCMDebugTrace />

        {/* Firebase Test Panel */}
        <M1ssionFirebasePushTestPanel />

        {/* Comprehensive Diagnostic System */}
        <FirebaseNotificationDiagnostic />

        {/* Comprehensive Report Generator */}
        <FirebaseNotificationReport />

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Informazioni Tecniche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Firebase Project:</strong> m1ssion-app
              </div>
              <div>
                <strong>Supabase Project:</strong> vkjrqirvdvjbemsfzxof
              </div>
              <div>
                <strong>Edge Function:</strong> send-firebase-push
              </div>
              <div>
                <strong>Database Table:</strong> user_push_tokens
              </div>
              <div>
                <strong>Service Worker:</strong> /firebase-messaging-sw.js
              </div>
              <div>
                <strong>VAPID Key:</strong> Configurata ✅
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Troubleshooting:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Se nessun token è presente, attivare le notifiche push dall'app</li>
                <li>Verificare che le notifiche siano abilitate nel browser</li>
                <li>Su Safari iOS, l'app deve essere aggiunta alla home screen (PWA)</li>
                <li>Controllare i logs dell'Edge Function per errori FCM</li>
                <li>Verificare che il Firebase Server Key sia configurato correttamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}