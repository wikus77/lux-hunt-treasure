# Changelog M1SSION™ — v1.0
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-03  
**Status:** STUB - TODO completare con dati reali

---

## v6.x Series (Attuale)

### v6.7.0 (Ottobre 2025)
```yaml
features:
  - "Sistema i18n multilingua (IT/EN/FR) con localStorage persistence"
  - "Telemetria AI events completa per NORAH analytics"
  - "Knowledge Base RAG popolata con documenti ufficiali"
  - "Audit security DEFINER views per RLS compliance"

fixes:
  - "RLS policy infinite recursion risolto con security definer functions"
  - "Cache policy PWA ottimizzato per offline-first"
  - "Final Shot daily limits enforcement corretto"

improvements:
  - "Performance embeddings search <300ms con HNSW index"
  - "Session bootstrap automatico per conversazioni NORAH"
  - "Debounce 250ms su telemetry logging"
```

### v6.6.0 (Settembre 2025)
```yaml
features:
  - "NORAH AI v5 con multi-intent support"
  - "NBA Pills interactive per engagement utente"
  - "Episodic memory system per continuità conversazionale"
  - "BUZZ Map con raggio progressivo 500km→50km"

fixes:
  - "GPS mock detection migliorato per anti-frode"
  - "Stripe webhook handling per subscription lifecycle"
  - "Push notifications FCM/APNS unified"
```

### v6.5.0 (Agosto 2025)
```yaml
features:
  - "Lancio missione primaria con premi fisici"
  - "Final Shot con limiti per tier (Free:2, Titanium:12)"
  - "Early access tier-based (Titanium: 72h anticipo)"

fixes:
  - "Cooldown BUZZ enforcement per tier corretto"
  - "Admin dashboard security hardening"
```

---

## v5.x Series (Legacy)

TODO: aggiungere v5.x history se rilevante per supporto/backport

---

## FAQ Comuni (per RAG Assistant)

**Q: Qual è l'ultima versione disponibile?**  
A: v6.7.0 (Ottobre 2025) con i18n multilingua, telemetria AI completa, e Knowledge Base RAG popolata.

**Q: Come si aggiorna l'app?**  
A: Su iOS via App Store, su Android via Google Play. L'app notifica automaticamente aggiornamenti disponibili. PWA si aggiorna automaticamente al caricamento successivo (refresh dopo 24h).

**Q: Posso vedere lo storico completo dei cambiamenti?**  
A: Sì, consulta questo documento CHANGELOG_v1.md oppure visita https://m1ssion.com/changelog (TODO: link reale)

---

## Note per Developer

- **Semantic versioning:** MAJOR.MINOR.PATCH (es. 6.7.0)
- **Branch strategy:** `main` (prod), `dev` (staging), `feature/*` (nuove feature)
- **Release process:** Tag `vX.Y.Z` + deploy automatico via GitHub Actions
- **Breaking changes:** Solo su MAJOR version bump (es. 6.x → 7.x)

---

**IMPORTANT:** Questo è uno stub da completare con dati reali da repository CHANGELOG_NORAH.md e CHANGELOG_NORAH_v4.2.md

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
