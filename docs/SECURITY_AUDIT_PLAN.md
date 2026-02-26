# Security Audit Plan — Final Shoot & Marker Rewards Hardening

**Repo:** lux-hunt-treasure  
**Scope:** Audit trail, proof hash, antifraud log, official emails, atomic transactions for Final Shoot and Marker Rewards.  
**Approach:** 5 phases, ultra safe, step-by-step, zero refactor of business logic except Phase 5 (Marker → RPC).

---

## Obiettivo finale (5 fasi)

1. **Audit trail** — Tracciabilità strutturata (tabelle/colonne audit) per tentativi e vincite Final Shoot, e per claim Marker.
2. **Proof hash** — Integrità dimostrabile (hash deterministico su payload vincita/claim) per Final Shoot e Marker.
3. **Log antifrode** — Request_id, IP hash, UA hash (minimizzazione GDPR) per contestualizzare tentativi e claim.
4. **Email ufficiali** — Notifica email al vincitore Final Shoot e (opzionale) al claim di premi fisici Marker, con log invio.
5. **Transazioni atomiche complete** — Marker: spostare claim + erogazione reward in una singola RPC transazionale; Final Shoot già transazionale.

---

## Fasi (overview)

| Fase | Contenuto | Output |
|------|-----------|--------|
| **Phase 1** | Analisi + preparazione sicurezza; mappa integrazioni; piano tecnico Phase 2–5; tag baseline. | Tag `safety/hardening-baseline-*`, `reports/HARDENING_PHASE1_BASELINE.md`, `docs/SECURITY_AUDIT_PLAN.md`. |
| **Phase 2** | Audit trail DB + proof hash (migrazioni + aggiornamento RPC/Edge). | Tabelle/colonne audit; colonna proof_hash; RPC/Edge aggiornate. |
| **Phase 3** | Antifrode log (IP/UA hash, request_id); minimizzazione GDPR. | Tabella antifraud_log; integrazione in Final Shoot (client/Edge) e Marker (Edge). |
| **Phase 4** | Email ufficiali (trigger o invoke da RPC/Edge + template + log). | Edge send-final-shoot-winner-email, send-marker-prize-email; log email. |
| **Phase 5** | Transazioni atomiche Marker: RPC unica claim + reward; Edge thin wrapper. | RPC `claim_marker_reward_rpc`; refactor Edge. |

---

## Vincoli

- Intervento **ultra safe**: nessun refactor superfluo; modifiche incrementali e verificabili.
- **Stop conditions**: se emergono rischi su RLS, SECURITY DEFINER, PII o email provider, annotare e fermarsi fino a review.
- Riferimento tecnico dettagliato: **`reports/HARDENING_PHASE1_BASELINE.md`** (mappa punti, cosa aggiungere, checklist Phase 2–5, file/tabelle/funzioni, diff plan).

---

## Baseline

- **Tag:** `safety/hardening-baseline-YYYYMMDD-HHMM` (creato in Phase 1).
- **Report Phase 1:** `reports/HARDENING_PHASE1_BASELINE.md`.

---

## Riferimenti

- Audit read-only completo: `reports/FINAL_SHOOT_MARKER_REWARDS_AUDIT_REPORT.md`.
- Migrazioni Final Shoot: `supabase/migrations/20260126_004_*`, `20260117_001_*`, `20251203_mission_command_center.sql`.
- Marker: `supabase/functions/claim-marker-reward/index.ts`, `supabase/migrations/20250814124057_*`, `20250114_003_*`.

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
