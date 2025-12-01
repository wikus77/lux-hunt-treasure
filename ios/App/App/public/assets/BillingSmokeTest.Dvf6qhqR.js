import { j as jsxRuntimeExports } from './ui-vendor.DoN6OTIp.js';
import { r as reactExports } from './react-vendor.CAU3V3le.js';
import { a as useToast, az as TestTube, C as Card, b as CardHeader, c as CardTitle, aH as CreditCard, W as CardDescription, d as CardContent, f as Button, i as functionsBaseUrl } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

const BillingSmokeTest = () => {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { toast } = useToast();
  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${functionsBaseUrl}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountCents: 1e3,
          // 10.00 EUR
          currency: "eur"
        })
      });
      const data = await response.json();
      if (response.ok && data.clientSecret) {
        toast({
          title: "✅ Payment Intent Created",
          description: `Client Secret: ${data.clientSecret.substring(0, 20)}...`,
          duration: 5e3
        });
        console.log("Payment Intent Success:", data);
      } else {
        throw new Error(data.error || "Failed to create Payment Intent");
      }
    } catch (error) {
      console.error("Payment Intent Error:", error);
      toast({
        title: "❌ Payment Intent Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
        duration: 5e3
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-b from-background to-background/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "h-8 w-8 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Stripe Smoke Test" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }),
          "Payment Intent Test"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Test Stripe live payment infrastructure without processing actual payments. This creates a Payment Intent for €10.00 to verify backend connectivity." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Test Amount:" }),
            " €10.00"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Currency:" }),
            " EUR"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Endpoint:" }),
            " create-payment-intent"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleCreatePaymentIntent,
            disabled: isLoading,
            className: "w-full",
            size: "lg",
            children: isLoading ? "Creating Payment Intent..." : "Create Payment Intent (€10)"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground bg-muted p-3 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
          " This is a smoke test page for development purposes. It only creates Payment Intents without processing payments. Check browser console for detailed responses."
        ] }) })
      ] }) })
    ] })
  ] }) });
};

export { BillingSmokeTest as default };
