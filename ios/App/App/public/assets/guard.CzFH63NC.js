function assertPkMatchesMode(serverMode) {
  const pk = "pk_live_51QJWtNRp5StPxarejrEVvghG3FX5h1jm4Cj3b1DsHaIyhlQcSZeFWwhLy60ke87bD0nxaXkuc1fEgCaYsOzKk7wJ00HI7zz7h3";
  const clientMode = pk.startsWith("pk_live_") ? "live" : pk.startsWith("pk_test_") ? "test" : "unknown";
  if (serverMode === "unknown") {
    throw new Error("Stripe mode non determinabile dal server");
  }
  if (clientMode !== serverMode) {
    if (window.location.hostname.includes("lovableproject.com")) {
      return;
    }
    throw new Error("Stripe mode mismatch: contatta il supporto.");
  }
}

export { assertPkMatchesMode };
