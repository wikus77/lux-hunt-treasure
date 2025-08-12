// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
# ✅ CHECK ESITI OBBLIGATORI – PRIMA DI PASSARE AL RESTO
Compilare e incollare:

- [ ] **ZOOM**: screenshot mappa a Z=12 (marker QR assenti) e a Z=17 (marker presenti).
- [ ] **GEO**: dump console `useGeoWatcher` → `{ granted, lat, lng, acc, ageSec }`.
- [ ] **NAV**: click marker → URL mostrato in console `/qr?c=...` (encoded).
- [ ] **VALIDATE**: output `validate-qr` con `{valid:true}` per un codice attivo.
- [ ] **REDEEM**: prima chiamata `200 {ok:true}`, seconda `409 already_redeemed` (log inclusi).
- [ ] **CORS**: headers `Access-Control-Allow-Origin/Methods/Headers` presenti su OPTIONS e POST.
- [ ] **REGRESSIONI**: conferma nessun impatto su BUZZ MAPPA / Tasto BUZZ / pagamenti.
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
