import { onRequestPost as __api_stripe_webhook_ts_onRequestPost } from "/Users/josephmule/lux-hunt-treasure/functions/api/stripe-webhook.ts"

export const routes = [
    {
      routePath: "/api/stripe-webhook",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_stripe_webhook_ts_onRequestPost],
    },
  ]