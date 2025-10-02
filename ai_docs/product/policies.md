# Policies — M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-02  
**Status:** OFFICIAL PRODUCT BIBLE

---

## Refund Policy

### Principi Generali
```yaml
diritto_recesso:
  eu_consumer_rights: "14 giorni dalla data acquisto"
  condizioni: "Rimborso possibile solo se servizio non consumato (nessun BUZZ/BUZZ Map/Final Shot utilizzato)"
  
rimborsi_ammessi:
  - "Errore tecnico impedisce utilizzo servizio"
  - "Addebito duplicato o non autorizzato"
  - "Abbonamento cancellato entro 48h dall'acquisto senza utilizzo alcuno"
  - "Bug grave che impedisce accesso funzionalità pagate"
  
rimborsi_non_ammessi:
  - "Utente ha utilizzato BUZZ/BUZZ Map del periodo"
  - "Utente ha sbloccato indizi premium o fatto Final Shot"
  - "Cambio idea dopo aver fruito delle feature premium"
  - "Insoddisfazione personale dopo utilizzo normale servizio"
  
procedura:
  step_1: "Contatto supporto tramite support@m1ssion.com o ticket in-app"
  step_2: "Verifica utilizzo servizio da parte team (check database)"
  step_3: "Decisione entro 5 giorni lavorativi"
  step_4: "Rimborso su metodo pagamento originale (7-14 giorni via Stripe)"
```

### Casi Speciali
```yaml
errore_tecnico_grave:
  definizione: "App inutilizzabile >24h consecutive, perdita progressi per bug, impossibilità accesso servizi pagati"
  rimedio: "Rimborso parziale proporzionale o crediti compensativi (es. 1 mese gratis)"
  
upgrade_errato:
  scenario: "Utente fa upgrade per errore (es. tap accidentale)"
  soluzione: "Downgrade immediato + rimborso completo se entro 24h e nessun utilizzo feature premium"
  
downgrade_volontario:
  effetto: "Feature premium disponibili fino a fine periodo pagato, poi downgrade automatico"
  rimborso: "Nessun rimborso per periodo già pagato"
```

---

## Fair Play Policy

### Obiettivo
Garantire che tutti gli utenti giochino rispettando le regole, senza exploit o comportamenti scorretti che danneggino l'esperienza collettiva.

### Comportamenti Proibiti
```yaml
gps_spoofing:
  definizione: "Uso di app/tool per falsificare posizione GPS"
  detection: "Algoritmi pattern analysis + device fingerprinting"
  sanzioni: "1° warning, 2° ban 7gg, 3° ban permanente"
  
multi_accounting:
  definizione: "Creazione account multipli per stesso utente"
  detection: "Device fingerprint, IP, payment method match"
  sanzioni: "Chiusura account secondari + warning account principale"
  
bot_automation:
  definizione: "Script automatici per BUZZ/BUZZ Map"
  detection: "Pattern timing inumani, API abuse"
  sanzioni: "Ban immediato 30gg + review manuale"
  
exploit_bug:
  definizione: "Sfruttamento bug noti per vantaggi ingiusti"
  sanzioni: "Ban temporaneo + rollback progressi ottenuti via exploit"
  
harassment:
  definizione: "Comportamento offensivo verso altri utenti o staff"
  sanzioni: "Ban immediato permanente"
```

### Sistema di Warning
```yaml
livelli:
  warning_1: "Email + notifica in-app, nessuna sanzione immediata"
  warning_2: "Ban temporaneo 7 giorni + sospensione abbonamento"
  warning_3: "Ban permanente + no refund abbonamento + cancellazione account"
  
appeal:
  permesso: true
  metodo: "Ticket supporto con oggetto 'Appeal Ban' o email appeals@m1ssion.com"
  review_time: "10 giorni lavorativi per risposta"
  info_richieste: "User ID, data ban, spiegazione dettagliata"
```

---

## Privacy Policy (Estratto per AI Assistant)

### Principi GDPR
```yaml
data_collected:
  essenziali:
    - "Email, user_id, device_id"
    - "Posizione GPS (solo se consenso attivo)"
    - "Cronologia BUZZ/BUZZ Map/Final Shot"
    - "Abbonamento tier e pagamenti"
  analytics:
    - "Tempo in app, rotta navigazione, feature utilizzate"
    - "Interazioni con AI Assistant (conversazioni)"
  
consenso_richiesto:
  geolocalizzazione: true
  analytics: false # tracciamento base senza PII
  marketing: true # newsletter, offerte
  
diritti_utente:
    - "Accesso dati (export JSON)"
    - "Cancellazione dati (right to be forgotten)"
    - "Rettifica dati errati"
    - "Portabilità dati"
```

### Gestione Dati Sensibili
```yaml
geolocalizzazione:
  utilizzo: "Solo per feature BUZZ/BUZZ Map/Final Shot durante utilizzo attivo"
  storage: "Coordinate aggregate per analytics, no tracciamento continuo background"
  sharing: "Mai condiviso con terze parti o advertisers"
  retention: "Coordinate esatte cancellate dopo 90 giorni, solo aggregate mantenute"
  
conversazioni_ai:
  logging: "Anonimizzato per QA (no PII in logs accessibili)"
  retention: "90 giorni poi cancellazione automatica (eccetto conversazioni flagged per training)"
  opt_out: "Utente può disattivare memoria AI dalle impostazioni"
  training: "Conversazioni possono essere usate per training AI (anonimizzate)"
  
pagamenti:
  processor: "Stripe (PCI-DSS compliant Level 1)"
  storage: "M1SSION non memorizza mai dati carta - solo Stripe customer_id"
  sicurezza: "3D Secure obbligatorio per transazioni >50€"
```

### Link Policy Completa
```yaml
privacy_policy_url: "https://m1ssion.com/privacy"
terms_of_service_url: "https://m1ssion.com/terms"
cookie_policy_url: "https://m1ssion.com/cookies"
fair_play_policy_url: "https://m1ssion.com/fair-play"
```

---

## Anti-Discrimination Policy

### Impegno M1SSION™
```yaml
principio: "M1SSION è accessibile a tutti, senza discriminazioni di alcun tipo"

protezioni:
  - "Nessuna discriminazione per età, genere, etnia, religione, orientamento"
  - "Accessibilità per disabilità (screen reader, high contrast, font size)"
  - "Prezzo tier equo in tutte le regioni UE"
  
moderazione:
  contenuti_utente: "Non presente chat/forum pubblici al momento - no moderazione contenuti necessaria"
  segnalazioni: "Report abuse button in profili utenti + review manuale entro 24h"
  azioni_possibili: "Warning, ban temporaneo, ban permanente secondo gravità"
```

---

## Changelog & Transparency

### Notifiche Cambiamenti Policy
```yaml
notifica_utente:
  metodo: "Email + notifica in-app + banner temporaneo"
  anticipo: "Minimo 30 giorni prima dell'effetto"
  
accettazione_richiesta:
  cambio_sostanziale: "Utente deve accettare nuovi termini per continuare"
  cambio_minore: "Notifica informativa, continuazione implicita"
```

---

## FAQ Comuni (per RAG Assistant)

**Q: Posso ottenere un rimborso se non sono soddisfatto?**  
A: Dipende. Se hai utilizzato i servizi premium (BUZZ, BUZZ Map, early access), il rimborso non è generalmente applicabile. Per errori tecnici o addebiti non autorizzati, contatta il supporto.

**Q: Cosa succede se uso GPS falso?**  
A: È una violazione della Fair Play Policy. Sanzioni progressive: warning, ban temporaneo, ban permanente.

**Q: M1SSION vende i miei dati a terze parti?**  
A: No, mai. I tuoi dati sono usati solo per fornire il servizio M1SSION e migliorare l'esperienza.

**Q: Posso cancellare il mio account e tutti i dati?**  
A: Sì, hai diritto alla cancellazione completa (GDPR right to be forgotten). Contatta il supporto.

**Q: Come vengono gestite le conversazioni con l'AI Assistant?**  
A: Anonimizzate per QA, retention 90 giorni, puoi opt-out dalla memoria AI dalle impostazioni. Le conversazioni possono essere usate per training AI (sempre anonimizzate).

---

## Note per Developer

- **Refund handling:** Integrazione Stripe refund API
- **Ban system:** Tabella `blocked_users` o flag in `profiles`
- **GPS spoofing detection:** Libreria detection + pattern analysis
- **Privacy compliance:** Data export endpoint + delete user endpoint
- **Policy version tracking:** Campo `accepted_policy_version` in `profiles`

---

**IMPORTANT:** L'assistente AI deve sempre linkare alle policy complete quando rilevante e NON inventare clausole non presenti.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
