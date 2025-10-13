// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { getProjectRef, functionsBaseUrl } from '@/lib/supabase/functionsBase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Shield, Terminal, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DevStripeKeysSetup = () => {
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const { toast } = useToast();

  // Validation regexes
  const publishableKeyRegex = /^pk_live_[A-Za-z0-9]{99,}$/;
  const secretKeyRegex = /^sk_live_[A-Za-z0-9]{99,}$/;

  const isPublishableValid = publishableKeyRegex.test(publishableKey);
  const isSecretValid = secretKeyRegex.test(secretKey);
  const areKeysValid = isPublishableValid && isSecretValid;

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiato negli appunti!",
        description: `${description} copiato con successo.`,
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti.",
        variant: "destructive",
      });
    }
  };

  const generateSupabaseCLICommand = () => {
    return `supabase secrets set \\
  STRIPE_PUBLISHABLE_KEY="${publishableKey}" \\
  STRIPE_SECRET_KEY="${secretKey}"`;
  };

  const createGitHubWorkflow = async () => {
    const workflowContent = `name: Set Supabase Stripe Secrets
on:
  workflow_dispatch:
    inputs:
      STRIPE_PUBLISHABLE_KEY:
        description: 'pk_live_*'
        required: true
      STRIPE_SECRET_KEY:
        description: 'sk_live_*'
        required: true
jobs:
  set-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install Supabase CLI
        run: |
          curl -fsSL https://cli.supabase.com/install/linux | sh
          echo "$HOME/.supabase/bin" >> $GITHUB_PATH
      - name: Login & Link
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase link --project-ref "\${{ secrets.PROJECT_REF }}"
      - name: Set Secrets
        run: |
          supabase secrets set \\
            STRIPE_PUBLISHABLE_KEY="\${{ inputs.STRIPE_PUBLISHABLE_KEY }}" \\
            STRIPE_SECRET_KEY="\${{ inputs.STRIPE_SECRET_KEY }}"`;

    // Create a downloadable file
    const blob = new Blob([workflowContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'set-supabase-secrets.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Workflow creato!",
      description: "File scaricato. Posizionalo in .github/workflows/ della tua repo.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-4">
            <Shield className="w-3 h-3 mr-1" />
            DEV SETUP
          </Badge>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Stripe Live Keys Setup
          </h1>
          <p className="text-muted-foreground">
            Configura le chiavi Stripe LIVE in modo sicuro tramite Supabase CLI o GitHub Actions
          </p>
        </div>

        {/* Warning Alert */}
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Sicurezza:</strong> Le secret keys non vengono mai esposte nel frontend. 
            Usa solo strumenti CLI/CI per inserirle nei Supabase Project Secrets.
          </AlertDescription>
        </Alert>

        {/* Keys Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Chiavi Stripe LIVE
            </CardTitle>
            <CardDescription>
              Inserisci le chiavi LIVE dal tuo dashboard Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publishable">
                Publishable Key (pk_live_...)
                {publishableKey && (
                  <Badge variant={isPublishableValid ? "default" : "destructive"} className="ml-2 text-xs">
                    {isPublishableValid ? "✓ Valida" : "✗ Invalida"}
                  </Badge>
                )}
              </Label>
              <Input
                id="publishable"
                type="text"
                placeholder="pk_live_..."
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                className={publishableKey && !isPublishableValid ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">
                Secret Key (sk_live_...)
                {secretKey && (
                  <Badge variant={isSecretValid ? "default" : "destructive"} className="ml-2 text-xs">
                    {isSecretValid ? "✓ Valida" : "✗ Invalida"}
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="secret"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="sk_live_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className={secretKey && !isSecretValid ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5" />
                Supabase CLI
              </CardTitle>
              <CardDescription>
                Copia il comando per impostare i secrets tramite CLI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => copyToClipboard(generateSupabaseCLICommand(), "Comando CLI")}
                disabled={!areKeysValid}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copia comando CLI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Github className="h-5 w-5" />
                GitHub Action
              </CardTitle>
              <CardDescription>
                Scarica il workflow per CI/CD automatico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createGitHubWorkflow}
                variant="outline"
                className="w-full"
              >
                <Github className="w-4 h-4 mr-2" />
                Crea GitHub Action
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {areKeysValid && (
          <Card>
            <CardHeader>
              <CardTitle>Comandi e Istruzioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Comando Supabase CLI</h4>
                <div className="bg-muted/50 p-3 rounded-md font-mono text-sm overflow-x-auto">
                  {generateSupabaseCLICommand()}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. GitHub Action Setup</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Scarica il file workflow e posizionalo in <code>.github/workflows/</code></p>
                  <p>• Vai su GitHub → Repo → Settings → Secrets and variables → Actions</p>
                  <p>• Crea questi secrets:</p>
                  <div className="ml-4 font-mono">
                    <p>- SUPABASE_ACCESS_TOKEN (dal tuo profilo Supabase)</p>
                    <p>- PROJECT_REF ({getProjectRef()})</p>
                  </div>
                  <p>• Esegui il workflow manualmente da GitHub Actions tab</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground">
          🔒 Questa pagina è solo per sviluppatori. Le secret keys non vengono mai salvate localmente.
        </div>
      </div>
    </div>
  );
};

export default DevStripeKeysSetup;