# REPORT FIX — CTA «GIOCA» + posizione + motion pill

**Data:** 2026-04-02  
**Scope:** Solo `HomeGiocaCta.tsx` e `FloatingPillLayerV3.tsx` (UI/motion). Nessun cambio a BottomNav, header, logica pill.

---

## 1. Forensics summary

| Problema | Causa probabile |
|----------|------------------|
| **Testo poco visibile** | `text-white` su gradiente molto scuro/ciano + Orbitron: percezione di basso contrasto; nessun `text-shadow` dedicato sul label; icona Play 20px competeva visivamente con il testo. |
| **CTA troppo alta** | `bottom: calc(88px + safe + 14px)` — 14px di margine aggiuntivo sopra l’area tab bar effettiva, CTA “tirata” verso il centro schermo. |
| **Pill istantanei** | Due `motion.div` che animavano **solo** `opacity` in 0,28s sull’intero binario sinistro/destro: niente `y`/`scale`, niente **stagger** per slot (Tempo, Battle, Prossima azione, Commit). |

---

## 2. File analizzati

| File | Ruolo | Coinvolgimento |
|------|--------|-----------------|
| `HomeGiocaCta.tsx` | CTA + portale | Contrasto, offset bottom, breathing |
| `FloatingPillLayerV3.tsx` | Pill float + play gate | Motion show/hide 4 pill |
| `HomePlaySurfaceContext.tsx` | Stato surface | Solo contesto (nessuna modifica) |
| `floating-pills-v3.ts` | `FLOATING_PILLS_V3_Z_INDEX` | Riferimento z-index CTA (invariato) |
| `AppHome.tsx` | Mount provider/CTA | Nessuna modifica in questo fix |

---

## 3. File toccati

| File | Modifica | Motivo | Rischio |
|------|----------|--------|---------|
| `HomeGiocaCta.tsx` | Label in `<span>` con colore `#EAFBFF` + doppio glow + ombra nera; icona `h-4 w-4`; bordo leggermente più chiaro; `bottom` +6px invece di +14px | Leggibilità e ancoraggio basso | Basso |
| `FloatingPillLayerV3.tsx` | `playPillMotionProps(i)`: enter `opacity+y+scale`, stagger `~74ms`, durata `0,44s`, ease cubic; exit rapido; `useReducedMotion` | Motion premium senza toccare i componenti pill | Basso |

---

## 4. Fix applicati

- **Testo CTA:** colore quasi bianco freddo, `text-shadow` (cyan glow + core shadow scuro), icona ridotta per bilanciare la label.
- **Posizione:** `calc(88px + env(safe-area-inset-bottom) + 6px)` — CTA più vicina alla Bottom Nav, sempre sopra l’area ~88px della tab bar.
- **Animazione pill:** ogni pill (Tempo, Battle, Prossima azione, Commit) è in un `motion.div` con `delay: 0,09 + index * 0,074`, `y: 12 → 0`, `scale: 0,97 → 1`, `opacity`; chiusura `0,22s` senza stagger inverso (evita “cheap” reverse cascade).
- **Invariato:** backdrop `HOME_PLAY_SURFACE_BACKDROP_CLASS`, callback `onTap`, Agent pill, gate/context, z-index layer.

---

## 5. Test eseguiti

- `npm run build` — OK.

Verifica consigliata su dispositivo: lettura label GIOCA, distanza dalla tab bar, sequenza di comparsa pill al tap, riduzione motion iOS.

---

## 6. Rischi residui

- Altezze tab bar diverse da 88px su varianti layout: stesso vincolo già usato dal layer pill V3.

---

## 7. GO / NO-GO

- **CTA leggibile:** sì (contrasto e glow dedicati al testo).  
- **Posizione:** sì (più bassa, +6px).  
- **Motion pill:** sì (fade-up + scale morbido + stagger).  
- **Prossimi mini-game:** nessun impatto.

---

## 8. Comandi finali

```bash
npm run build
npm run cap:ios:incremental
```
