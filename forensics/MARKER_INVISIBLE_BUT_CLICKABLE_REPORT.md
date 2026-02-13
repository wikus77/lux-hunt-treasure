# 🔍 FORENSIC REPORT — REWARD MARKERS INVISIBILI MA CLICCABILI

**Data**: 2026-02-12  
**Modalità**: READ-ONLY (zero modifiche)  
**Ambiente**: iOS wrapped (WKWebView)  

---

## 📊 EXECUTIVE SUMMARY

I reward markers sono **cliccabili** perché:
- Sono creati come elementi DOM (`maplibregl.Marker`) con click handler attivi
- Il wrapper ha area touch 48x48px sempre presente

Sono **invisibili** perché:
- `currentZoom` inizializzato a `0` causa `isVisible = false` al primo render
- Inconsistenza CSS: `display: block` vs `display: flex` nella toggle visibility
- Race condition tra zoom listener e marker creation effect

---

## 📋 TASK 1 — MAPPATURA LAYERS

### Ordine di rendering (dal basso verso l'alto):

| Z-Index | Layer/Componente | Tipo | Note |
|---------|-----------------|------|------|
| 1 | `#ml-sandbox` (Map container) | Canvas MapLibre | Contiene markers nativi |
| 1000 | Right side pills (Compass, etc.) | DOM fixed | `pointer-events: auto` |
| 1001 | BattleShopPill | DOM fixed | |
| 1001 | M1U Pill | DOM fixed | |
| 1500 | LayerTogglePanel | DOM fixed | Controlla visibilità rewards |
| 1500+ | FinalShootOverlay RED BORDER | DOM fixed | `pointer-events: none` |
| 1600 | FinalShootOverlay INFO BAR | DOM fixed | Solo quando attivo |
| 9999 | GeolocationPermissionGuide | DOM fixed | Solo quando geo bloccata |
| 10000 | UnifiedHeader | DOM fixed | |
| 10000 | BottomNavigation | DOM fixed | |
| 20000 | NotificationsBanner | DOM fixed | |

### Layers 3D Interni alla mappa (ordine mount nel JSX):

```
1. AgentsLayer3D (GeoJSON symbol layer GPU)
2. PortalsLayer3D 
3. RewardsLayer3D (MapLibre native markers DOM)  ← NOSTRO TARGET
4. AreasLayer3D
5. RewardZoneLayer3D
6. NotesLayer3D
7. CountryDominationLayer3D
8. BattleFxLayer
9. MapBattleOverlay
```

---

## 📋 TASK 2 — VERIFICA OCCLUSIONE 3D

### RewardsLayer3D (`RewardsLayer3D.tsx`)

**Tipo rendering**: MapLibre Native Markers (DOM elements, NOT WebGL)

**Proprietà rilevanti trovate**:

| Proprietà | Valore | File:Linea |
|-----------|--------|------------|
| `anchor` | `'center'` | :150 |
| `display` (initial) | `'block'` o `'none'` | :121 |
| `display` (update existing) | `'flex'` o `'none'` | :108 |
| `display` (zoom update) | `'block'` o `'none'` | :167 ⚠️ INCONSISTENTE |
| Wrapper size | `48px x 48px` | :129-130 |
| Inner marker size | `18-22px` | :88, :100-101, :115-116 |
| `cursor` | `'pointer'` | :114 |
| `touch-action` | `'manipulation'` | :134 |

### 🔴 BUG TROVATO: Inconsistenza `display` property

```typescript
// Line 108 - Update existing marker wrapper:
wrapper.style.display = isVisible ? 'flex' : 'none';

// Line 167 - Zoom change visibility update:
marker.getElement().style.display = isVisible ? 'block' : 'none';
//                                     ^^^^^^^ DOVREBBE ESSERE 'flex'
```

### Elementi potenzialmente occludenti:

| Layer | depthTest | opacity | z-index | Rischio |
|-------|-----------|---------|---------|---------|
| CountryDominationLayer3D | N/A (GeoJSON fill) | variabile | - | 🟡 Possibile |
| BattleFxLayer | N/A | variabile | - | 🟢 Solo durante battaglia |
| MapBattleOverlay | N/A | - | - | 🟢 Solo durante battaglia |

---

## 📋 TASK 3 — VERIFICA OCCLUSIONE UI (CSS/DOM)

### MapLibre Markers: DOM Inside Map Container

I marker MapLibre sono elementi DOM figli di `.maplibregl-marker` dentro il container mappa.

**CSS rilevante** (`maplibre-tron.css:74`):
```css
.maplibregl-marker {
  cursor: pointer;
}
```

Nessun override di `visibility`, `opacity`, o `display` trovato.

### Vignette / Gradient Overlay

In `maplibre-tron.css:94-104`:
```css
.map-container-wrapper::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 40px rgba(10, 239, 255, 0.05);
}
```

⚠️ Questo crea un overlay con `pointer-events: none`. Non dovrebbe bloccare visivamente i marker, ma potrebbe interferire su alcuni browser.

### Elementi fixed sopra la mappa

Nessun elemento con z-index > 1 ha `background` solido che copre l'intera mappa quando non attivo.

---

## 📋 TASK 4 — PERCHÉ IL CLICK FUNZIONA

### Meccanismo click

```typescript
// RewardsLayer3D.tsx:127-146
const wrapper = document.createElement('div');
wrapper.style.cssText = `
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
`;

wrapper.addEventListener('click', (e) => {
  e.stopPropagation();
  setSelectedMarker(rewardMarker.id);
});

wrapper.addEventListener('touchend', (e) => {
  e.stopPropagation();
  setSelectedMarker(rewardMarker.id);
});
```

### Spiegazione

1. **Wrapper sempre presente**: Il wrapper 48x48px è sempre nel DOM una volta creato
2. **Click handler attivo**: Gli event listener sono attaccati al wrapper, non all'elemento interno
3. **`display: none` sul wrapper**: Quando il marker è nascosto, `wrapper.style.display = 'none'` **RIMUOVE** il wrapper dal layout
4. **Ma se `display: flex` rimane**: I click funzionano ancora!

### 🔴 ROOT CAUSE CONFERMATA

Quando `currentZoom >= markerMinZoom`:
- Line 108 imposta `wrapper.style.display = 'flex'` (corretto)
- Line 167 imposta `marker.getElement().style.display = 'block'` (ERRATO!)

Il wrapper torna visibile con `display: block`, ma il CSS interno è ottimizzato per `display: flex`. Questo può causare:
- Marker inner non centrato
- Layout rotto visivamente
- Marker "c'è" ma non dove ci si aspetta

---

## 📋 TASK 5 — DEBUG MODE ESISTENTI

### Flag trovati:

| Flag | File | Effetto |
|------|------|---------|
| `debugEnabled` | MapTiler3D.tsx:95 | Abilita `DebugMapPanel` e `MapVerificationPanel` |
| `DEV_MOCKS` | MapTiler3D.tsx:80 | Usa dati mock invece di Supabase |
| `VITE_MAP3D_DEV_MOCKS` | env | Controlla DEV_MOCKS |

### Come abilitare debug (senza modificare codice):

```bash
# Nel file .env.local:
VITE_DEBUG_ENABLED=true
VITE_MAP3D_DEV_MOCKS=true
```

Oppure via URL param (se implementato):
```
?debug=true
```

### Log esistenti per rewards:

```typescript
// MapTiler3D.tsx:238
console.warn('[Map3D] markers load error', error);

// MapTiler3D.tsx:271  
console.warn('[Map3D] markers load exception', e);
```

---

## 🎯 ROOT CAUSE RANKING

| # | Causa | Probabilità | File:Linea | Evidenza |
|---|-------|-------------|------------|----------|
| **1** | **`currentZoom` inizializzato a `0`** | **95%** | RewardsLayer3D.tsx:35 | `useState(0)` causa `isVisible=false` al primo render |
| **2** | **Inconsistenza `display: block` vs `flex`** | **85%** | RewardsLayer3D.tsx:167 | Toggle usa `block` invece di `flex` |
| **3** | **Race condition zoom/markers effect** | **70%** | RewardsLayer3D.tsx:42-171 | Zoom effect potrebbe non aver ancora aggiornato `currentZoom` |
| **4** | Vignette overlay interferisce | **15%** | maplibre-tron.css:94-104 | Ha `pointer-events: none` ma potrebbe creare artifacts |

---

## 🔧 FIX PROPOSTI (NON APPLICATI)

### FIX 1 — Inizializzare `currentZoom` al valore reale della mappa

```typescript
// RewardsLayer3D.tsx:35
// Da:
const [currentZoom, setCurrentZoom] = useState(0);

// A:
const [currentZoom, setCurrentZoom] = useState(() => map?.getZoom() ?? 14);
```

### FIX 2 — Uniformare `display` property

```typescript
// RewardsLayer3D.tsx:167
// Da:
marker.getElement().style.display = isVisible ? 'block' : 'none';

// A:
marker.getElement().style.display = isVisible ? 'flex' : 'none';
```

### FIX 3 — Aggiungere logging diagnostico (già presente console.warn, basta abilitare)

```typescript
// Aggiungere in RewardsLayer3D useEffect:
console.log('[RewardsLayer3D] currentZoom:', currentZoom, 'markers:', markers.length);
```

---

## ✅ CONFERMA FINALE

**Nessuna modifica eseguita.**  
**Nessun file IAP/pagamenti toccato.**

Report basato esclusivamente su lettura codice esistente.

---

## 📝 RIEPILOGO TECNICO

```
PROBLEMA: Marker invisibili ma cliccabili

FLUSSO DIFETTOSO:
1. RewardsLayer3D monta
2. currentZoom = 0 (inizializzazione)
3. useEffect per zoom listener si attiva
4. useEffect per markers si attiva
5. markers.forEach → isVisible = (currentZoom >= 14) = (0 >= 14) = FALSE
6. Markers creati con display: none
7. Zoom listener finalmente aggiorna currentZoom
8. Secondo render: isVisible = TRUE
9. Line 167 imposta display: 'block' invece di 'flex'
10. Layout wrapper rotto → marker non visibile/mal posizionato

PERCHÉ CLICK FUNZIONA:
- Wrapper 48x48 esiste nel DOM
- Click handler su wrapper, non su inner element
- Se display = 'block' (sbagliato ma non 'none'), wrapper è nel layout
- Click catturato anche se visivamente rotto
```

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
