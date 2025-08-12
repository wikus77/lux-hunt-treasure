// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ

# CONTEXT (DO NOT REMOVE)
- Stack: React + PWA (Vite), Leaflet map, Supabase client, Web Push attive, iOS Safari compat.
- Logiche blindate da NON toccare: BUZZ MAPPA, Tasto BUZZ, pagamenti in-app, header/nav, pricing.
- Obiettivo: 1) Geolocalizzazione affidabile, 2) Notifica quando l’utente è vicino a un QR attivo, 3) Marker QR visibili solo a zoom elevato, 4) Click su marker → naviga a /qr?c=<CODE> senza errori. 
- Tutto il codice prodotto deve essere firmato con: `// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ`
- Nessun riferimento a “Lovable” nel sorgente.

# TASKS
1) **Geolocalizzazione robusta (foreground-only)**
   - Implementa un `useGeoWatcher()` che usa `navigator.geolocation.watchPosition` con:
     - `enableHighAccuracy:true, maximumAge:10_000, timeout:10_000`.
     - iOS handling: prompt permessi + fallback a `getCurrentPosition` su errore `PERMISSION_DENIED`.
     - Stato esposto: `{ coords:{lat,lng,acc}, granted:boolean, error?:string }`.
     - Nessun tracking in background.

2) **Prossimità a QR (geofence lato client)**
   - Ricevi lista QR attivi (solo lat,lng,code) dal backend già esistente (`/qr/near` o equivalente; se non disponibile usa la lista minima presente nello store dei marker mappa).
   - Calcola distanza Haversine; se `distance <= 75m`:
     - Mostra *in-app toast* e `new Notification("M1SSION™ – QR vicino", { body: "Sei a ~XXm dal codice", tag:"qr-near" })` se permesso `granted`.
     - Mai inviare posizione al server senza consenso esplicito dell’utente.
   - Debounce notifiche: non più di 1 ogni 10 minuti per stesso QR (LocalStorage key `qr-notified:<code>`).

3) **Visibilità Marker QR solo ad alto zoom**
   - Parametro costante: `QR_VISIBILITY_MIN_ZOOM = 16` (modificabile da env).
   - Implementa listener Leaflet: `map.on('zoomend', ...)` che:
     - se `map.getZoom() >= QR_VISIBILITY_MIN_ZOOM` → mostra layer markers QR,
     - altrimenti nasconde il layer (senza rimuovere altri layer mappa).
   - NON usare clustering; nascondi/mostra con `LayerGroup` per prestazioni.

4) **Click su Marker → Navigazione sicura**
   - Click apre `/qr?c=<CODE>` con `encodeURIComponent`.
   - Se `CODE` contiene caratteri speciali, assicurati che la rotta legga `c` correttamente.
   - Log di debug (solo dev): `console.debug("[QR] navigate", code)`.

5) **Pagina /qr – validazione**
   - `GET ${VITE_QR_VALIDATE_URL}?c=<code>` → Se `valid: true` mostra CTA “Riscatta”.
   - `POST ${VITE_QR_REDEEM_URL}` con `{ code, user_id }` (token supabase user) → se ok mostra “Buzz accreditato”.
   - Gestisci 401/403/404/409 con messaggi chiari (“non valido”, “già usato”, “permessi”, “scaduto”).
   - Nessuna modifica alle logiche interne Buzz: solo invocazione endpoint.

6) **CORS & Errors – lato client**
   - Preflight: invia `Content-Type: application/json`.
   - Non usare `mode:'no-cors'`.
   - Riprova esponenziale su 429/5xx (max 3 tentativi).

7) **Telemetria minima (dev only)**
   - `console.debug` su: permessi geoloc, zoom corrente, toggle layer QR, endpoint chiamati, status.

# ACCEPTANCE TESTS
- A1: Con zoom 12 i marker QR NON sono visibili; a zoom 17 compaiono.
- A2: Con utente a ≤75m da un QR, arriva toast e Web Notification (se consentita).
- A3: Click marker → /qr?c=<CODE> (URL encoded) senza errori in console.
- A4: /qr valida e riscatta con risposte previste (valid, already_redeemed, invalid, forbidden).
- A5: Nessuna regressione su BUZZ MAPPA, Tasto BUZZ, pagamenti.

# DELIVERABLES
- Nuovo hook `src/hooks/useGeoWatcher.ts`.
- Aggiornamenti mappa: layer QR con gating zoom.
- Fix su /qr page e navigazione.
- Env support: `VITE_QR_VISIBILITY_MIN_ZOOM`, `VITE_QR_VALIDATE_URL`, `VITE_QR_REDEEM_URL`.
- Tutti i file firmati.
// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
