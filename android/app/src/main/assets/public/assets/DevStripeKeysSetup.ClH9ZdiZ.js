import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { k as createLucideIcon, a as useToast, B as Badge, _ as Shield, aI as Alert, aJ as AlertDescription, C as Card, b as CardHeader, c as CardTitle, W as CardDescription, d as CardContent, L as Label, I as Input, f as Button, aK as EyeOff, aL as Eye, aM as Copy, aN as getProjectRef } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Github = createLucideIcon("Github", [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      key: "tonef"
    }
  ],
  ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Terminal = createLucideIcon("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);

const DevStripeKeysSetup = () => {
  const [publishableKey, setPublishableKey] = reactExports.useState("");
  const [secretKey, setSecretKey] = reactExports.useState("");
  const [showSecretKey, setShowSecretKey] = reactExports.useState(false);
  const { toast } = useToast();
  const publishableKeyRegex = /^pk_live_[A-Za-z0-9]{99,}$/;
  const secretKeyRegex = /^sk_live_[A-Za-z0-9]{99,}$/;
  const isPublishableValid = publishableKeyRegex.test(publishableKey);
  const isSecretValid = secretKeyRegex.test(secretKey);
  const areKeysValid = isPublishableValid && isSecretValid;
  const copyToClipboard = async (text, description) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiato negli appunti!",
        description: `${description} copiato con successo.`
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti.",
        variant: "destructive"
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
    const blob = new Blob([workflowContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "set-supabase-secrets.yml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Workflow creato!",
      description: "File scaricato. Posizionalo in .github/workflows/ della tua repo."
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-background to-muted/20 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-1" }),
        "DEV SETUP"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent", children: "Stripe Live Keys Setup" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Configura le chiavi Stripe LIVE in modo sicuro tramite Supabase CLI o GitHub Actions" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-yellow-500/50 bg-yellow-500/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sicurezza:" }),
        " Le secret keys non vengono mai esposte nel frontend. Usa solo strumenti CLI/CI per inserirle nei Supabase Project Secrets."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-5 w-5" }),
          "Chiavi Stripe LIVE"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Inserisci le chiavi LIVE dal tuo dashboard Stripe" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "publishable", children: [
            "Publishable Key (pk_live_...)",
            publishableKey && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isPublishableValid ? "default" : "destructive", className: "ml-2 text-xs", children: isPublishableValid ? "✓ Valida" : "✗ Invalida" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "publishable",
              type: "text",
              placeholder: "pk_live_...",
              value: publishableKey,
              onChange: (e) => setPublishableKey(e.target.value),
              className: publishableKey && !isPublishableValid ? "border-destructive" : ""
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "secret", children: [
            "Secret Key (sk_live_...)",
            secretKey && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: isSecretValid ? "default" : "destructive", className: "ml-2 text-xs", children: isSecretValid ? "✓ Valida" : "✗ Invalida" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "secret",
                type: showSecretKey ? "text" : "password",
                placeholder: "sk_live_...",
                value: secretKey,
                onChange: (e) => setSecretKey(e.target.value),
                className: secretKey && !isSecretValid ? "border-destructive" : ""
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-0 top-0 h-full px-3",
                onClick: () => setShowSecretKey(!showSecretKey),
                children: showSecretKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-5 w-5" }),
            "Supabase CLI"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Copia il comando per impostare i secrets tramite CLI" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => copyToClipboard(generateSupabaseCLICommand(), "Comando CLI"),
            disabled: !areKeysValid,
            className: "w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-2" }),
              "Copia comando CLI"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-5 w-5" }),
            "GitHub Action"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Scarica il workflow per CI/CD automatico" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: createGitHubWorkflow,
            variant: "outline",
            className: "w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "w-4 h-4 mr-2" }),
              "Crea GitHub Action"
            ]
          }
        ) })
      ] })
    ] }),
    areKeysValid && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Comandi e Istruzioni" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "1. Comando Supabase CLI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/50 p-3 rounded-md font-mono text-sm overflow-x-auto", children: generateSupabaseCLICommand() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "2. GitHub Action Setup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "• Scarica il file workflow e posizionalo in ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: ".github/workflows/" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Vai su GitHub → Repo → Settings → Secrets and variables → Actions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Crea questi secrets:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4 font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "- SUPABASE_ACCESS_TOKEN (dal tuo profilo Supabase)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "- PROJECT_REF (",
                getProjectRef(),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Esegui il workflow manualmente da GitHub Actions tab" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground", children: "🔒 Questa pagina è solo per sviluppatori. Le secret keys non vengono mai salvate localmente." })
  ] }) });
};

export { DevStripeKeysSetup as default };
