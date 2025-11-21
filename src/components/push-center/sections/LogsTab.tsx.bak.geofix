// © 2025 Joseph MULÉ – M1SSION™ – Push Center Logs Tab
"use client";

import React from 'react';
import { getProjectRef } from '@/lib/supabase/functionsBase';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogsTab() {
  const SUPABASE_PROJECT_ID = getProjectRef();

  const openLogs = (functionName: string) => {
    window.open(
      `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/functions/${functionName}/logs`,
      '_blank'
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-gray-700">
        <h3 className="font-semibold text-white mb-4">Edge Function Logs</h3>
        <p className="text-gray-400 text-sm mb-4">
          Visualizza i logs delle Edge Functions direttamente dalla dashboard Supabase.
        </p>
        
        <div className="space-y-2">
          <Button
            onClick={() => openLogs('webpush-upsert')}
            variant="outline"
            className="w-full justify-between"
          >
            <span>webpush-upsert logs</span>
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => openLogs('webpush-send')}
            variant="outline"
            className="w-full justify-between"
          >
            <span>webpush-send logs</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-700 bg-blue-500/5">
        <h4 className="font-semibold text-blue-400 mb-2">Log Filters</h4>
        <p className="text-sm text-gray-400 mb-3">
          Quando visualizzi i logs, cerca questi pattern per identificare problemi:
        </p>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li><code className="text-orange-400">error</code> - Errori generici</li>
          <li><code className="text-orange-400">[WEBPUSH-UPSERT]</code> - Log specifici upsert</li>
          <li><code className="text-orange-400">[WEBPUSH-SEND]</code> - Log specifici invio</li>
          <li><code className="text-orange-400">401</code> - Errori di autenticazione</li>
          <li><code className="text-orange-400">500</code> - Errori server</li>
          <li><code className="text-green-400">✅</code> - Operazioni riuscite</li>
          <li><code className="text-red-400">❌</code> - Operazioni fallite</li>
        </ul>
      </div>

      <div className="p-4 rounded-lg border border-gray-700 bg-purple-500/5">
        <h4 className="font-semibold text-purple-400 mb-2">Quick Debug Tips</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>
            <strong>No logs appearing?</strong> Assicurati che le funzioni siano state deployate e invocate almeno una volta.
          </li>
          <li>
            <strong>CORS errors?</strong> Verifica che le funzioni includano gli header CORS corretti per il tuo dominio.
          </li>
          <li>
            <strong>401 Unauthorized?</strong> Controlla che il JWT sia valido e non scaduto.
          </li>
          <li>
            <strong>500 errors?</strong> Verifica che tutti i secrets (VAPID, PUSH_ADMIN_TOKEN) siano configurati.
          </li>
        </ul>
      </div>
    </div>
  );
}
