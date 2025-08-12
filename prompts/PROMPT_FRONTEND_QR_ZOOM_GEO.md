// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
# 🔧 M1SSION™ – FIX FRONTEND **IMMEDIATI** (Map + QR + Geo)
**NON TOCCARE**: logiche blindate (BUZZ MAPPA, Tasto BUZZ, pagamenti, header/nav).  
**Stile**: PWA-ready, iOS Safari OK, nessun riferimento a Lovable nei sorgenti.  
**Firma obbligatoria su ogni file**: `// © 2025 M1MISSION™ NIYVORA KFT– Joseph MULÉ`.

## 1) Marker QR visibili SOLO ad alto zoom
- Imposta **QR_VISIBILITY_MIN_ZOOM = 17** (accetta override via `VITE_QR_VISIBILITY_MIN_ZOOM`).
- Crea/usa un `LayerGroup` dedicato ai marker QR (es. `qrLayer`).
- All’init mappa: **non** aggiungere `qrLayer`.
- `map.on('zoomend', ...)`: se `map.getZoom() >= QR_VISIBILITY_MIN_ZOOM` → `qrLayer.addTo(map)`; altrimenti `map.removeLayer(qrLayer)`.
- Nessun clustering. Solo toggle layer (prestazioni + UX).
- I marker **non devono essere visibili** nella situazione della **FOTO 1**; **devono** apparire nella **FOTO 2** (zoom più vicino).

## 2) Click su marker → /qr?c=<CODE> (robusto)
- `navigate("/qr?c=" + encodeURIComponent(code))`.
- Log dev: `console.debug("[QR] navigate", code)`.

## 3) Geolocalizzazione **reale** + Overlay diagnostico
- Nuovo hook `src/hooks/useGeoWatcher.ts`:
  - `navigator.geolocation.watchPosition` con `{ enableHighAccuracy:true, maximumAge:10000, timeout:10000 }`.
  - Fallback a `getCurrentPosition` su `PERMISSION_DENIED`.
  - Stato: `{ granted:boolean, error?:string, coords?:{lat:number,lng:number,acc:number}, ts?:number }`.
- **Overlay diagnostico** (pill in alto a dx, solo dev):
  - Mostra: `status (Granted/Denied)`, `lat,lng`, `±acc(m)`, `age(sec)`.
  - Pulsante: `Richiedi permesso` (richiama `Notification.requestPermission()` e geoloc).
  - Pulsante: `Test “QR vicino”` → calcola distanza Haversine al QR più vicino e mostra toast/console con distanza.

## 4) Notifica prossimità (foreground)
- Se `distance <= 75m`: 
  - toast in-app **sempre**;
  - `new Notification("M1SSION™ – QR vicino", { body:"Sei a ~XXm", tag:"qr-near" })` **solo se** `Notification.permission === "granted"`.
- Debounce per QR: 1 notifica ogni 10 minuti (LocalStorage `qr-notified:<code>`).

## 5) Pagina /qr robusta (no-error)
- Usa **solo** URL da env:
  - `VITE_QR_VALIDATE_URL`
  - `VITE_QR_REDEEM_URL`
- Flusso:
  - `GET .../validate?c=<code>` → se `{valid:true}` mostra CTA “Riscatta”.
  - `POST .../redeem` body `{ code, user_id }` con Auth Supabase (JWT utente).
- Retry 3 tentativi su 429/5xx (backoff 250/500/1000ms).
- Messaggi chiari: `invalid`, `already_redeemed`, `forbidden`, `expired`.

## 6) Prove oggettive (da incollare in chat)
- Screenshot **prima/dopo** con zoom (marker assenti a Z<17; presenti a Z≥17).
- Output console di `useGeoWatcher` (granted/coords/acc/age).
- URL effettivi usati da /qr (stampali in console senza chiavi).

## Deliverables
- `src/hooks/useGeoWatcher.ts`
- Patch mappa: layer QR con gating zoom.
- Fix pagina `/qr` (solo endpoint da env + retry).
- Overlay diagnostico (dev-only).
- Tutti i file firmati.
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
