# Final Shot — Regole Ufficiali M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-02  
**Status:** OFFICIAL PRODUCT BIBLE

---

## Definizione

**Final Shot** è il tentativo finale di claim del premio M1SSION™. È l'azione conclusiva che l'utente esegue quando ritiene di aver identificato la posizione esatta del premio.

---

## Regole Generali

```yaml
accesso:
  requisiti: "Minimo 1 indizio sbloccato, GPS attivo, tier con accesso Final Shot"
  disponibilita_per_tier:
    free: "Sempre disponibile (con limiti)"
    silver: "Sempre disponibile (con limiti)"
    gold: "Disponibile da metà missione (50% durata missione trascorsa)"
    black: "Sempre disponibile senza restrizioni temporali"
    titanium: "Sempre disponibile + suggerimenti AI Norah"
  verifica_posizione: true
  gps_required: true
  
tentativo:
  tipo: "Tentativi multipli per missione secondo tier"
  cooldown_tra_tentativi: "2 ore tra un tentativo e l'altro"
  costo: "Gratuito (incluso nel piano)"
  
verifica_successo:
  metodo: "Distanza da coordinate esatte premio"
  tolleranza_metri: 50
  verifica_admin: "Automatica se <50m, manuale se 50-100m per validazione finale"
```

---

## Limiti per Tier

```yaml
free_tier:
  tentativi_per_missione: 2
  cooldown: "2 ore tra tentativi"
  disponibilita: "Sempre (dall'inizio missione)"
  livello_indizi: "Solo livello 1"
  
silver_tier:
  tentativi_per_missione: 3
  cooldown: "2 ore tra tentativi"
  disponibilita: "Sempre (dall'inizio missione)"
  livello_indizi: "Livello 1-2"
  
gold_tier:
  tentativi_per_missione: 5
  cooldown: "1 ora tra tentativi"
  disponibilita: "Da metà missione (50% durata trascorsa)"
  livello_indizi: "Livello 1-3"
  
black_tier:
  tentativi_per_missione: 8
  cooldown: "30 minuti tra tentativi"
  disponibilita: "Sempre disponibile (nessuna restrizione)"
  livello_indizi: "Livello 1-4"
  
titanium_tier:
  tentativi_per_missione: 12
  cooldown: "Nessuno"
  disponibilita: "Sempre disponibile"
  livello_indizi: "Completo (1-5)"
  feature_speciale: "Suggerimenti AI Norah durante Final Shot"
```

---

## Anti-Frode

### Protezioni Implementate

```yaml
geo_verification:
  gps_mock_detection: true
  movimento_fisico_required: "Utente deve fisicamente raggiungere location (no GPS fake)"
  coordinate_history_check: "Verifica pattern GPS realistici (no teleport)"
  accuracy_check: "GPS accuracy <20m richiesta"
  
rate_limiting:
  database_table: "agent_finalshot_attempts"
  max_attempts_per_mission: "Secondo tier (vedi sopra)"
  enforcement: "check_final_shot_limit(user_id, mission_id, tier)"
  cooldown_enforcement: "Verifica timestamp ultimo tentativo"
  
suspicious_activity:
  detection_patterns:
    - "Location jump >100 km in <5 minuti"
    - "Tentativi simultanei da device/IP diversi"
    - "Pattern automatizzati/bot (>3 tentativi in <1 minuto)"
    - "GPS mock detected via accuracy anomalies"
  conseguenze: "1° warning, 2° ban 24h, 3° ban 7 giorni, 4° ban permanente + review manuale"
```

---

## Flow Utente

### Pre-Final Shot
1. Utente ha sbloccato indizi sufficienti
2. Sistema verifica requisiti (tier, cooldown, tentativi rimanenti)
3. Mostra checklist preparazione (GPS attivo, posizione, indizi)
4. Richiede conferma utente

### Durante Final Shot
```yaml
steps:
  1_gps_check: "Verifica GPS accuracy <20m e mock detection"
  2_position_capture: "Cattura coordinate esatte utente"
  3_distance_calculation: "Calcola distanza da target mission (Haversine formula)"
  4_verification: "Automatica se <50m, manuale admin se 50-100m"
  5_result: "Success (<50m) o Failed (>50m) con feedback distanza"
  6_ai_suggestions: "Solo Titanium: Norah AI dà hint direzionali se Failed"
```

### Post-Final Shot
```yaml
success:
  notifica: "🎉 Congratulazioni! Hai trovato il premio M1SSION™"
  azioni:
    - "Registra vincita su agent_finalshot_attempts"
    - "Notifica team admin per validazione premio fisico"
    - "Sblocca badge/reward digitale immediato"
    - "Aggiorna classifica e profilo"
    - "Invia email conferma vincita"
  
failed:
  notifica: "❌ Tentativo non andato a buon fine. Sei a X metri dal target."
  feedback: "Mostra distanza esatta + direzione cardinale (Nord/Sud/Est/Ovest)"
  feedback_titanium: "Norah AI: 'Prova a spostarti verso [direzione] di circa [distanza]'"
  cooldown_applied: true
  tentativi_rimanenti: "Mostra contatore: X tentativi rimasti per questa missione"
```

---

## Tabelle Database Coinvolte

```sql
-- Tentativi Final Shot
agent_finalshot_attempts (
  id, user_id, coords, result, created_at
)

-- Limiti giornalieri
daily_final_shot_limits (
  user_id, mission_id, attempt_date, attempts_count
)

-- Funzione verifica
check_daily_final_shot_limit(user_id, mission_id) -> boolean
```

---

## FAQ Comuni (per RAG Assistant)

**Q: Quanti tentativi Final Shot ho?**  
A: Dipende dal tuo tier: Free (2), Silver (3), Gold (5), Black (8), Titanium (12). Cooldown tra tentativi: Free/Silver 2h, Gold 1h, Black 30min, Titanium nessuno.

**Q: Posso fare Final Shot senza GPS?**  
A: No, GPS è obbligatorio per garantire fair play e verificare posizione reale con accuracy <20m.

**Q: Cosa succede se fallisco il Final Shot?**  
A: Ricevi feedback con distanza esatta dal target e direzione. Cooldown applicato secondo tier. Tentativi rimanenti mostrati. Titanium riceve suggerimenti AI Norah.

**Q: Il Final Shot costa qualcosa?**  
A: No, è gratuito e incluso nel piano di abbonamento.

**Q: Come so se sono abbastanza vicino per il Final Shot?**  
A: Devi decifrare gli indizi sbloccati. L'app non dà hint preventivi (tranne Titanium dopo tentativo fallito). Tolleranza: <50m per successo automatico.

**Q: Posso fare Final Shot su più missioni contemporaneamente?**  
A: Sì, i limiti sono per missione. Ogni missione ha il proprio contatore tentativi. Cooldown è globale (non puoi fare 2 Final Shot su missioni diverse nello stesso momento).

---

## Note per Developer

- **Edge Function:** `submit-final-shot` (se esiste) o logica in app
- **Verifica tier:** Controllare `profiles.subscription_tier`
- **Calcolo distanza:** `calculate_qr_distance(lat1, lng1, lat2, lng2)`
- **Anti-mock GPS:** Implementare detection lato Edge Function
- **Logging:** Registrare ogni tentativo per analytics e anti-frode

---

**IMPORTANT:** L'assistente AI deve sempre fare riferimento a questo documento per rispondere a domande su Final Shot. NON inventare regole.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
