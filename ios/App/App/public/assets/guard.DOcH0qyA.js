function assertPkMatchesMode(serverMode) {
  const pk = "pk_test_51QJWtNRp5StPxareRp0GNVD9BT0auKQ8LEeezlPROQcwiDQ6nGOd0UihU5Y9fjJFD3naTwx3YsHoPPzlJ5Alk4pD00FhZM6lyZ";
  const clientMode = pk.startsWith("pk_live_") ? "live" : pk.startsWith("pk_test_") ? "test" : "unknown";
  console.log("[STRIPE GUARD] Mode check:", { clientMode, serverMode, pk: pk.substring(0, 12) });
  if (serverMode === "unknown") {
    console.warn("Stripe server mode is unknown. Check STRIPE_SECRET_KEY on server.");
    throw new Error("Stripe mode non determinabile dal server");
  }
  if (clientMode !== serverMode) {
    console.warn(`⚠️ Stripe mode mismatch: client=${clientMode} server=${serverMode}`);
    if (window.location.hostname.includes("lovableproject.com")) {
      console.warn("⚠️ DEV/PREVIEW MODE: Allowing Stripe mode mismatch for testing");
      console.warn("⚠️ In production, client and server modes MUST match!");
      return;
    }
    throw new Error("Stripe mode mismatch: contatta il supporto.");
  }
  console.log("[STRIPE GUARD] ✅ Mode check passed");
}

export { assertPkMatchesMode };
