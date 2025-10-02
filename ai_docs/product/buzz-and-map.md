# BUZZ & BUZZ Map — Specifiche Ufficiali M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-02  
**Status:** OFFICIAL PRODUCT BIBLE

---

## BUZZ (Azione Attiva)

### Definizione
BUZZ è un'azione attiva che esegue una scansione geolocalizzata e sblocca indizi/aree secondo regole dinamiche basate su tier utente e progressione.

### Caratteristiche Principali
- **Tipo:** Azione singola attivabile ovunque nell'app
- **Contesto:** Non richiede necessariamente apertura mappa
- **Output:** Sblocca indizi, aggiorna stato progressione, rivela aree

### Regole Dinamiche
```yaml
costo_e_raggio:
  determinazione: "Varia in base a tier abbonamento"
  costo: "Gratuito (incluso nel piano)"
  raggio_scan: "2 km (raggio di scansione standard per tutti i tier)"
  
cooldown:
  applicato: true
  durata_per_tier:
    free: "24 ore"
    silver: "12 ore"
    gold: "8 ore"
    black: "4 ore"
    titanium: "Nessuno (può usare 7 BUZZ quando vuole nella settimana)"
  bypass: "Non disponibile - rispettare cooldown o upgrade tier"

anti_abuso:
  rate_limiting: "Max 7 BUZZ per settimana (limite massimo Titanium)"
  verifica_posizione: "GPS required - tolerance radius 100m"
  blacklist_zone: "Nessuna zona esclusa al momento"
  mock_gps_detection: "Rilevamento GPS fake attivo - ban temporaneo se rilevato"
```

---

## BUZZ Map (Azione Contestuale Mappa)

### Definizione
BUZZ Map è la stessa logica di BUZZ, ma contestualizzata all'interno della visualizzazione mappa con overlay, aree sbloccate, feedback visivo e markers.

### Caratteristiche Distintive
- **Tipo:** Interazione contestuale dalla mappa (overlay + UI dedicata)
- **Contesto:** Richiede mappa aperta
- **Feedback:** Visualizzazione immediata aree/premi sbloccati

### Primo BUZZ Map (Regola Speciale)
```yaml
primo_buzz_map:
  raggio_km: 500
  prezzo_eur: 4.99
  condizione: "Utente non ha mai eseguito BUZZ Map in precedenza"
  verifica: "Check su tabella buzz_map_actions per user_id"
  
incentivo_marketing:
  messaggio: "Primo BUZZ Map sbloccabile ora: raggio 500 km a €4,99"
  valore_percepito: "Ottimo rapporto qualità/prezzo per iniziare l'esplorazione"
```

### Dinamica Progressiva (dopo primo BUZZ Map)
```yaml
progressione_raggio:
  formula: "raggio = 500 - (N_buzz_map * 50) con minimo 50 km"
  esempio: "1° BUZZ Map: 500km, 2°: 450km, 3°: 400km ... 10°: 50km (poi resta 50km)"
  prezzo_dinamico: "€4,99 fisso per ogni BUZZ Map (indipendente dal raggio)"
  
limiti_per_tier:
  free: "0 BUZZ Map (feature non disponibile)"
  silver: "0 BUZZ Map (feature non disponibile)"
  gold: "0 BUZZ Map (feature non disponibile)"
  black: "1 BUZZ Map al mese (cooldown 30 giorni)"
  titanium: "2 BUZZ Map al mese (cooldown 15 giorni tra uno e l'altro)"
```

### UI Mappa (Componenti Visivi)
- **Bottone BUZZ Map:** Posizionato in overlay mappa
- **Aree sbloccate:** Visualizzazione con colori/opacity
- **Prize markers:** Icone differenziate per tipo premio
- **Feedback animato:** Pulse/glow dopo BUZZ Map success

---

## Differenze Chiave BUZZ vs BUZZ Map

| Aspetto | BUZZ | BUZZ Map |
|---------|------|----------|
| Contesto | Attivabile ovunque | Richiede mappa aperta |
| UI | Bottone standalone | Bottone + overlay mappa |
| Feedback | Notifica/toast | Visualizzazione aree |
| Utilizzo tipico | Quick scan on-the-go | Esplorazione strategica |
| Primo utilizzo speciale | No | Sì (500 km / €4,99) |

---

## Anti-Abuso & Fair Play

### Protezioni Implementate
```yaml
rate_limiting:
  descrizione: "Max BUZZ secondo tier: Free 1/sett, Silver 3/sett, Gold 4/sett, Black 5/sett, Titanium 7/sett"
  enforcement: "Check su buzz_logs per user_id - se quota superata blocca azione"
  
geo_verification:
  required: true
  tolerance_meters: 100
  mock_detection: "Rilevamento GPS fake via accuracy check + velocity impossibili"
  fallback: "Se GPS non disponibile: messaggio errore 'Attiva GPS per usare BUZZ'"
  
cooldown_enforcement:
  tabella: "buzz_logs"
  check: "Verifica ultimo timestamp per user_id rispetto a cooldown tier"
  bypass_condition: "Nessun bypass - tier più alti hanno solo cooldown ridotti"
  
abuse_detection:
  suspicious_patterns: "Location jump >100 km in <1 min, BUZZ frequency >7/settimana, GPS mock detected"
  conseguenze: "1° warning, 2° ban 24h, 3° ban 7 giorni, 4° ban permanente"
  appeal: "Contatto supporto per review ban"
```

---

## FAQ Comuni (per RAG Assistant)

**Q: Qual è la differenza tra BUZZ e BUZZ Map?**  
A: BUZZ è un'azione attiva che puoi fare ovunque nell'app per scansionare e sbloccare indizi. BUZZ Map è la stessa logica ma contestualizzata nella mappa, con visualizzazione immediata di aree e premi. Il primo BUZZ Map ha condizioni speciali: 500 km di raggio a €4,99.

**Q: Perché il primo BUZZ Map costa €4,99?**  
A: È un'offerta di lancio per incentivare l'esplorazione iniziale con un ottimo rapporto qualità/prezzo. Dopo il primo, il costo e raggio variano dinamicamente.

**Q: Posso fare BUZZ infiniti?**  
A: No, ci sono limiti basati sul tuo tier di abbonamento e cooldown anti-abuso per garantire fair play.

**Q: Il raggio diminuisce dopo ogni BUZZ Map?**  
A: Sì, il raggio diminuisce di 50 km dopo ogni BUZZ Map, partendo da 500 km fino a un minimo di 50 km. Formula: raggio = 500 - (N_buzz_map × 50) con minimo 50 km. Il prezzo resta fisso a €4,99.

**Q: Cosa succede se faccio BUZZ senza GPS attivo?**  
A: Riceverai un messaggio di errore: "Attiva GPS per usare BUZZ". Il GPS è obbligatorio per garantire fair play e localizzazione accurata.

---

## Note per Developer

- **Edge Function BUZZ:** `create_buzz` gestisce sia BUZZ che BUZZ Map
- **Verifica primo BUZZ Map:** Query `buzz_map_actions` WHERE `user_id` = ? 
- **Pricing dinamico:** Funzione `calculate_buzz_price(daily_count)` già implementata
- **Tabelle coinvolte:** `buzz_logs`, `buzz_map_actions`, `profiles` (per tier)

---

**IMPORTANT:** Questo documento è la fonte di verità ufficiale. L'assistente AI NON deve mai inventare regole BUZZ/BUZZ Map ma sempre fare riferimento a questo documento via RAG.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
