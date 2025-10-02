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
  determinazione: "Varia in base a tier abbonamento e progressione utente"
  formula: "<COMPILARE: inserire formula esatta costo/raggio per tier>"
  
cooldown:
  applicato: true
  durata: "<COMPILARE: es. 15 minuti, 1 ora, dipende da tier>"
  bypass: "<COMPILARE: possibile con abbonamento X o credits Y>"

anti_abuso:
  rate_limiting: "<COMPILARE: max N BUZZ per timeframe>"
  verifica_posizione: "<COMPILARE: GPS required? tolerance radius?>"
  blacklist_zone: "<COMPILARE: zone escluse, se presenti>"
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
  formula: "<COMPILARE: es. raggio = 500 - (N_buzz_map * 50) con min 50 km>"
  prezzo_dinamico: "<COMPILARE: es. base €4,99 + tier multiplier>"
  
limiti_per_tier:
  free: "<COMPILARE: max N BUZZ Map al giorno/settimana>"
  silver: "<COMPILARE>"
  gold: "<COMPILARE>"
  black: "<COMPILARE>"
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
  descrizione: "<COMPILARE: es. max 10 BUZZ/ora per Free tier>"
  
geo_verification:
  required: true
  tolerance_meters: "<COMPILARE: es. 100m>"
  mock_detection: "<COMPILARE: strategia rilevamento GPS fake>"
  
cooldown_enforcement:
  tabella: "buzz_logs o buzz_map_actions"
  check: "Verifica ultimo timestamp per user_id"
  bypass_condition: "<COMPILARE: tier Gold+ bypassa cooldown 50%?>"
  
abuse_detection:
  suspicious_patterns: "<COMPILARE: es. BUZZ frequency anomala, location jump impossibili>"
  conseguenze: "<COMPILARE: warning, temporary ban, permanent ban>"
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
A: <COMPILARE: confermare regola esatta progressione raggio>

**Q: Cosa succede se faccio BUZZ senza GPS attivo?**  
A: <COMPILARE: messaggio errore, requisiti GPS, alternative>

---

## Note per Developer

- **Edge Function BUZZ:** `create_buzz` gestisce sia BUZZ che BUZZ Map
- **Verifica primo BUZZ Map:** Query `buzz_map_actions` WHERE `user_id` = ? 
- **Pricing dinamico:** Funzione `calculate_buzz_price(daily_count)` già implementata
- **Tabelle coinvolte:** `buzz_logs`, `buzz_map_actions`, `profiles` (per tier)

---

**IMPORTANT:** Questo documento è la fonte di verità ufficiale. L'assistente AI NON deve mai inventare regole BUZZ/BUZZ Map ma sempre fare riferimento a questo documento via RAG.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
