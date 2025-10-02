# Subscription Tiers — M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-02  
**Status:** OFFICIAL PRODUCT BIBLE

---

## Overview Tier System

M1SSION™ offre 4 tier di abbonamento, ciascuno con feature e limiti progressivi per ottimizzare l'esperienza di gioco.

---

## Free Tier (Base)

```yaml
pricing:
  costo_mensile: 0€
  costo_annuale: 0€
  
feature_incluse:
  buzz_mensili: "<COMPILARE: es. 10 BUZZ al mese>"
  buzz_map_mensili: "<COMPILARE: es. 2 BUZZ Map al mese>"
  final_shot_giornalieri: "<COMPILARE: es. 1 tentativo/giorno>"
  indizi_base: true
  mappa_base: true
  notifiche_push: true
  early_access_missioni: false
  
limiti:
  cooldown_buzz: "<COMPILARE: es. 1 ora tra BUZZ>"
  cooldown_buzz_map: "<COMPILARE: es. 6 ore tra BUZZ Map>"
  supporto: "Community forum + AI Assistant base"
  ads: "<COMPILARE: presenti? assenti?>"
  
upgrade_incentive:
  messaggio: "Passa a Silver per sbloccare più BUZZ, cooldown ridotti e early access!"
```

---

## Silver Tier

```yaml
pricing:
  costo_mensile: "<COMPILARE: es. €9,99/mese>"
  costo_annuale: "<COMPILARE: es. €99/anno (2 mesi gratis)>"
  risparmio_annuale: "<COMPILARE: %>"
  
feature_incluse:
  buzz_mensili: "<COMPILARE: es. 50 BUZZ al mese>"
  buzz_map_mensili: "<COMPILARE: es. 10 BUZZ Map al mese>"
  final_shot_giornalieri: "<COMPILARE: es. 2 tentativi/giorno>"
  indizi_premium: true
  cooldown_ridotti: "50% rispetto a Free"
  early_access_missioni: "2 ore prima del lancio pubblico"
  badge_silver: true
  supporto: "AI Assistant avanzato + ticket priority"
  ads: false
  
limiti:
  cooldown_buzz: "<COMPILARE: es. 30 minuti>"
  cooldown_buzz_map: "<COMPILARE: es. 3 ore>"
  
benefits_esclusivi:
    - "Accesso anticipato nuove missioni"
    - "Indizi premium esclusivi"
    - "Badge distintivo profilo"
```

---

## Gold Tier

```yaml
pricing:
  costo_mensile: "<COMPILARE: es. €19,99/mese>"
  costo_annuale: "<COMPILARE: es. €199/anno>"
  risparmio_annuale: "<COMPILARE: %>"
  
feature_incluse:
  buzz_mensili: "<COMPILARE: es. 150 BUZZ al mese o illimitati?>"
  buzz_map_mensili: "<COMPILARE: es. 30 BUZZ Map al mese>"
  final_shot_giornalieri: "<COMPILARE: es. 5 tentativi/giorno>"
  indizi_premium: true
  cooldown_ridotti: "75% rispetto a Free"
  early_access_missioni: "24 ore prima del lancio pubblico"
  badge_gold: true
  supporto: "Supporto dedicato + priorità massima"
  ads: false
  analytics_avanzate: true
  
limiti:
  cooldown_buzz: "<COMPILARE: es. 15 minuti>"
  cooldown_buzz_map: "<COMPILARE: es. 1 ora>"
  
benefits_esclusivi:
    - "Accesso 24h anticipato missioni"
    - "Analytics dettagliate progressione"
    - "Evento esclusivi Gold members"
    - "Customizzazione profilo avanzata"
```

---

## Black Tier (VIP)

```yaml
pricing:
  costo_mensile: "<COMPILARE: es. €49,99/mese>"
  costo_annuale: "<COMPILARE: es. €499/anno>"
  risparmio_annuale: "<COMPILARE: %>"
  
feature_incluse:
  buzz_illimitati: true
  buzz_map_illimitati: true
  final_shot_giornalieri: "<COMPILARE: es. 10 tentativi/giorno o illimitati?>"
  indizi_premium: true
  cooldown_eliminati: "BUZZ e BUZZ Map senza cooldown"
  early_access_missioni: "48 ore prima del lancio pubblico"
  badge_black: true
  supporto: "Concierge service + linea diretta team M1SSION"
  ads: false
  analytics_avanzate: true
  beta_tester: true
  
benefits_esclusivi:
    - "BUZZ illimitati senza cooldown"
    - "Accesso 48h anticipato missioni"
    - "Beta tester feature nuove"
    - "Eventi VIP esclusivi"
    - "Merchandising M1SSION™ gratuito"
    - "Consulenza strategica con team"
```

---

## Confronto Rapido

| Feature | Free | Silver | Gold | Black |
|---------|------|--------|------|-------|
| BUZZ/mese | <COMPILARE> | <COMPILARE> | <COMPILARE> | ∞ |
| BUZZ Map/mese | <COMPILARE> | <COMPILARE> | <COMPILARE> | ∞ |
| Final Shot/giorno | <COMPILARE> | <COMPILARE> | <COMPILARE> | <COMPILARE> |
| Cooldown BUZZ | <COMPILARE> | 50% ridotto | 75% ridotto | Nessuno |
| Early Access | No | 2h | 24h | 48h |
| Supporto | Community | Priority | Dedicato | Concierge |
| Ads | <COMPILARE> | No | No | No |

---

## Upgrade Paths & Incentivi

### Free → Silver
```yaml
trigger_moment:
  - "Utente ha esaurito BUZZ mensili"
  - "Vuole fare BUZZ Map ma è in cooldown"
  - "Missione nuova in arrivo (early access appeal)"
  
messaggio_tipo: "Passa a Silver e sblocca 50 BUZZ al mese + early access 2h!"
conversion_rate_target: "<COMPILARE: es. 15%>"
```

### Silver → Gold
```yaml
trigger_moment:
  - "Utente power user (>80% BUZZ mensili utilizzati)"
  - "Vuole analytics avanzate"
  - "Interessato a eventi esclusivi"
  
messaggio_tipo: "Diventa Gold: BUZZ quasi illimitati + accesso 24h anticipato!"
conversion_rate_target: "<COMPILARE: es. 8%>"
```

### Gold → Black
```yaml
trigger_moment:
  - "Utente super engaged (daily active)"
  - "Richiede supporto concierge"
  - "Vuole zero limitazioni"
  
messaggio_tipo: "Black Tier: BUZZ illimitati, zero cooldown, VIP status"
conversion_rate_target: "<COMPILARE: es. 3%>"
```

---

## Gestione Downgrade

```yaml
policy:
  permesso: true
  effetto_immediato: false
  grace_period: "Fino a fine periodo già pagato"
  feature_retention: "Mantiene feature premium fino a scadenza"
  
downgrade_flow:
  free_tier_landing: "Utente torna a limiti Free al termine abbonamento"
  no_penalty: "Nessuna penale o perdita progressi"
  re_upgrade: "Possibile riattivare tier superiore in qualsiasi momento"
```

---

## FAQ Comuni (per RAG Assistant)

**Q: Cosa succede se esaurisco i BUZZ del mese?**  
A: Puoi aspettare il reset mensile o fare upgrade al tier superiore per più BUZZ.

**Q: Posso cambiare tier in qualsiasi momento?**  
A: Sì, upgrade immediato. Downgrade effettivo a fine periodo già pagato.

**Q: Early access significa che ho un vantaggio competitivo?**  
A: Sì, puoi iniziare a raccogliere indizi prima degli altri utenti, aumentando le possibilità di trovare il premio.

**Q: Il Black Tier ha davvero BUZZ illimitati?**  
A: <COMPILARE: confermare se veramente illimitati o "limite molto alto">

**Q: Quali metodi di pagamento accettate?**  
A: Stripe: carta credito/debito, Apple Pay, Google Pay, bonifico SEPA.

**Q: C'è trial gratuito per i tier a pagamento?**  
A: <COMPILARE: es. "7 giorni trial Silver", "14 giorni trial Gold">

---

## Note per Developer

- **Tabella:** `subscriptions` con campi `tier`, `status`, `current_period_end`
- **Verifica tier:** `get_active_subscription(user_id)` 
- **Limiti enforcement:** Check tier prima di ogni azione BUZZ/BUZZ Map/Final Shot
- **Stripe integration:** Webhook `checkout.session.completed` per attivazione
- **Early access:** Funzione `calculate_access_start_date(plan_name)`

---

**IMPORTANT:** L'assistente AI deve sempre fare riferimento a questo documento per informazioni su tiers. Placeholder `<COMPILARE>` vanno popolati con dati reali.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
