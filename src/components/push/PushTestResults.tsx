// M1SSION™ Push Test Results - Real Success Only
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PushTestResultsProps {
  result: {
    sent: number;
    failed: number;
    total?: number;
    to_delete?: number;
    details?: Array<{
      endpoint_type: string;
      status: number;
      error?: string;
    }>;
  } | null;
  loading: boolean;
}

export const PushTestResults: React.FC<PushTestResultsProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-white">Invio in corso...</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { sent, failed, total, to_delete, details } = result;
  const totalProcessed = sent + failed;
  const passRate = totalProcessed > 0 ? ((sent / totalProcessed) * 100).toFixed(1) : '0.0';
  
  // P0 Fix: Show success ONLY if no failures
  const isSuccess = failed === 0 && sent > 0;
  const isPartialSuccess = sent > 0 && failed > 0;
  const isFailure = sent === 0 && failed > 0;

  return (
    <div className="space-y-4">
      {/* Main Status */}
      <div className={`p-4 rounded-lg border ${
        isSuccess ? 'bg-green-950/50 border-green-500' :
        isPartialSuccess ? 'bg-yellow-950/50 border-yellow-500' :
        'bg-red-950/50 border-red-500'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : isPartialSuccess ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-semibold ${
            isSuccess ? 'text-green-400' :
            isPartialSuccess ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {isSuccess ? '✅ Successo Completo' :
             isPartialSuccess ? '⚠️ Successo Parziale' :
             '❌ Fallimento'}
          </span>
        </div>
        
        <div className="text-white space-y-1">
          <div>Inviati: <span className="text-green-400 font-mono">{sent}</span></div>
          <div>Falliti: <span className="text-red-400 font-mono">{failed}</span></div>
          <div>Pass Rate: <span className={`font-mono font-bold ${
            parseFloat(passRate) >= 99 ? 'text-green-400' :
            parseFloat(passRate) >= 90 ? 'text-yellow-400' :
            'text-red-400'
          }`}>{passRate}%</span></div>
          {to_delete && to_delete > 0 && (
            <div>Da eliminare: <span className="text-orange-400 font-mono">{to_delete}</span></div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      {details && details.length > 0 && (
        <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-700">
          <h4 className="text-white font-medium mb-2">📊 Dettagli per Endpoint</h4>
          <div className="space-y-2 text-sm">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-zinc-300">
                  {detail.endpoint_type === 'fcm' ? '🟢 FCM' :
                   detail.endpoint_type === 'apns' ? '🍎 Apple' :
                   '❓ Unknown'}
                </span>
                <span className={`font-mono ${
                  detail.status >= 200 && detail.status < 300 ? 'text-green-400' :
                  detail.status >= 400 && detail.status < 500 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {detail.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON (truncated for debugging) */}
      <details className="bg-zinc-900/20 rounded-lg border border-zinc-700">
        <summary className="p-3 cursor-pointer text-zinc-400 hover:text-white">
          🔍 Raw Response Data
        </summary>
        <pre className="p-3 text-xs text-zinc-300 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
};