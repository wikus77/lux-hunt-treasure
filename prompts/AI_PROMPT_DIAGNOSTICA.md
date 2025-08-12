// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ

# CHECKLIST DIAGNOSTICA – QR + MAPPA
- [ ] Geolocalizzazione: permessi = granted, coords aggiornate, nessun errore timeout.
- [ ] Zoom mappa: con Z=12 marker QR **non** visibili; con Z=17 **visibili**.
- [ ] Click marker → navigazione a `/qr?c=<CODE>` corretta (URL encoded).
- [ ] /qr validate → `200 {valid:true}`; redeem → `200 {ok:true}`; doppio redeem → `409`.
- [ ] Nessun warning CORS o `no-cors` in console.
- [ ] Nessuna regressione su BUZZ MAPPA / Tasto BUZZ / pagamenti.
- [ ] Notifica (toast + Web Notification) quando distanza ≤75m (foreground).
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
