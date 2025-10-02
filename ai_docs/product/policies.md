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
  condizioni: "<COMPILARE: servizio digitale consumato = no refund?>"
  
rimborsi_ammessi:
  - "Errore tecnico impedisce utilizzo servizio"
  - "Addebito duplicato o non autorizzato"
  - "Abbonamento cancellato entro <COMPILARE: es. 48h> dall'acquisto senza utilizzo"
  
rimborsi_non_ammessi:
  - "Utente ha utilizzato BUZZ/BUZZ Map del periodo"
  - "Utente ha partecipato a missioni con early access premium"
  - "Cambio idea dopo aver fruito delle feature premium"
  
procedura:
  step_1: "Contatto supporto tramite ticket o email"
  step_2: "Verifica utilizzo servizio da parte team"
  step_3: "Decisione entro <COMPILARE: es. 5 giorni lavorativi>"
  step_4: "Rimborso su metodo pagamento originale (7-14 giorni)"
```

### Casi Speciali
```yaml
errore_tecnico_grave:
  definizione: "<COMPILARE: es. app down >24h, perdita progressi per bug>"
  rimedio: "Rimborso parziale o crediti compensativi"
  
upgrade_errato:
  scenario: "Utente fa upgrade per errore"
  soluzione: "Downgrade immediato + rimborso differenza se entro 24h"
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
  warning_1: "Email + notifica in-app, nessuna sanzione"
  warning_2: "Ban temporaneo 7 giorni"
  warning_3: "Ban permanente + no refund abbonamento"
  
appeal:
  permesso: true
  metodo: "Ticket supporto con oggetto 'Appeal Ban'"
  review_time: "<COMPILARE: es. 10 giorni lavorativi>"
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
  utilizzo: "Solo per feature BUZZ/BUZZ Map/Final Shot"
  storage: "Coordinate aggregate, no tracciamento continuo"
  sharing: "Mai condiviso con terze parti"
  
conversazioni_ai:
  logging: "Anonimizzato per QA (no PII in logs pubblici)"
  retention: "<COMPILARE: es. 90 giorni poi cancellazione automatica>"
  opt_out: "Utente può disattivare memoria AI"
  
pagamenti:
  processor: "Stripe (PCI-DSS compliant)"
  storage: "M1SSION non memorizza dati carta"
```

### Link Policy Completa
```yaml
privacy_policy_url: "<COMPILARE: link completo privacy policy sito>"
terms_of_service_url: "<COMPILARE: link ToS>"
cookie_policy_url: "<COMPILARE: link cookie policy>"
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
  contenuti_utente: "<COMPILARE: policy moderazione chat/forum se presente>"
  segnalazioni: "Report abuse button + review manuale 24h"
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
A: Anonimizzate per QA, <COMPILARE: retention period>, puoi opt-out dalla memoria AI.

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
