// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import RagQuery from '@/components/RagQuery';
import { Brain, Database, Zap } from 'lucide-react';

export default function IntelligenceRAG() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-background via-background/95 to-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              M1SSION Intelligence
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-rajdhani">
            Ricerca semantica sulla Knowledge Base interna — Powered by Norah AI (RAG)
          </p>
          
          {/* Features badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-rajdhani text-primary">Vector Search</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/5 border border-accent/20">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-rajdhani text-accent">Instant Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query interface */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <RagQuery />
      </div>

      {/* Help section */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="rounded-lg border border-border/40 bg-card/50 p-4">
          <h3 className="text-sm font-orbitron font-semibold mb-2 text-foreground">
            💡 Esempi di domande
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground font-rajdhani">
            <li>• "Spiegami BUZZ e quando conviene usarlo rispetto a BUZZ Map"</li>
            <li>• "Quali sono le differenze tra i piani Free e Titanium?"</li>
            <li>• "Come funziona il sistema di rewards?"</li>
            <li>• "Cosa sono i QR codes e come si usano?"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
