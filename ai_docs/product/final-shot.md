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
  requisiti: "<COMPILARE: es. minimo N indizi sbloccati, tier minimo, etc.>"
  verifica_posizione: true
  gps_required: true
  
tentativo:
  tipo: "Singolo tentativo per missione attiva"
  cooldown: "<COMPILARE: es. 1 tentativo ogni 24h per missione>"
  costo: "<COMPILARE: gratis? costa credits? varia per tier?>"
  
verifica_successo:
  metodo: "<COMPILARE: distanza da coordinate esatte? QR code? entrambi?>"
  tolleranza_metri: "<COMPILARE: es. 50m, 100m>"
  verifica_admin: "<COMPILARE: richiede validazione manuale admin?>"
```

---

## Limiti per Tier

```yaml
free_tier:
  tentativi_giornalieri: "<COMPILARE: es. 1 tentativo/giorno>"
  tentativi_per_missione: "<COMPILARE: es. max 2 totali>"
  cooldown: "<COMPILARE: es. 24h tra tentativi>"
  
silver_tier:
  tentativi_giornalieri: "<COMPILARE>"
  tentativi_per_missione: "<COMPILARE>"
  cooldown: "<COMPILARE>"
  
gold_tier:
  tentativi_giornalieri: "<COMPILARE>"
  tentativi_per_missione: "<COMPILARE>"
  cooldown: "<COMPILARE>"
  
black_tier:
  tentativi_giornalieri: "<COMPILARE>"
  tentativi_per_missione: "<COMPILARE>"
  cooldown: "<COMPILARE: es. cooldown ridotto 50%>"
```

---

## Anti-Frode

### Protezioni Implementate

```yaml
geo_verification:
  gps_mock_detection: true
  movimento_fisico_required: "<COMPILARE: utente deve muoversi fisicamente?"
  coordinate_history_check: "<COMPILARE: verifica pattern GPS realistici>"
  
rate_limiting:
  database_table: "daily_final_shot_limits"
  max_attempts_per_day: "<COMPILARE: valore per tier base>"
  enforcement: "check_daily_final_shot_limit(user_id, mission_id)"
  
suspicious_activity:
  detection_patterns:
    - "<COMPILARE: es. location jump impossibili>"
    - "<COMPILARE: es. tentativi simultanei da device diversi>"
    - "<COMPILARE: es. pattern automatizzati/bot>"
  conseguenze: "<COMPILARE: warning, ban temporaneo, ban permanente>"
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
  1_gps_check: "Verifica GPS accuracy e mock detection"
  2_position_capture: "Cattura coordinate esatte utente"
  3_distance_calculation: "Calcola distanza da target mission"
  4_verification: "<COMPILARE: controllo automatico o manuale?>"
  5_result: "Success o Failed con feedback dettagliato"
```

### Post-Final Shot
```yaml
success:
  notifica: "Congratulazioni! Hai trovato il premio M1SSION™"
  azioni:
    - "Registra vincita su database"
    - "Notifica team admin per validazione"
    - "Sblocca premio/reward"
    - "<COMPILARE: altri step?>"
  
failed:
  notifica: "Tentativo non andato a buon fine. Distanza: X metri dal target"
  feedback: "<COMPILARE: dare hint? mostrare distanza esatta?>"
  cooldown_applied: true
  tentativi_rimanenti: "Mostra contatore"
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
A: Dipende dal tuo tier di abbonamento. <COMPILARE: specificare per ogni tier>

**Q: Posso fare Final Shot senza GPS?**  
A: No, GPS è obbligatorio per garantire fair play e verificare posizione reale.

**Q: Cosa succede se fallisco il Final Shot?**  
A: <COMPILARE: cooldown applicato, tentativi rimanenti, possibilità retry>

**Q: Il Final Shot costa qualcosa?**  
A: <COMPILARE: gratis/a pagamento/varia per tier>

**Q: Come so se sono abbastanza vicino per il Final Shot?**  
A: <COMPILARE: l'app dà hint? utente deve capirlo dagli indizi?>

**Q: Posso fare Final Shot su più missioni contemporaneamente?**  
A: <COMPILARE: limiti per missione attiva, limiti giornalieri cross-mission>

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
