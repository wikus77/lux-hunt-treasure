# Subscription Tiers — M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-02  
**Status:** OFFICIAL PRODUCT BIBLE

---

## Overview Tier System

M1SSION™ offre 5 tier di abbonamento, ciascuno con feature e limiti progressivi per ottimizzare l'esperienza di gioco.

---

## Free Tier (Base)

```yaml
pricing:
  costo_mensile: 0€
  costo_annuale: 0€
  
feature_incluse:
  buzz_settimanali: 1
  buzz_mensili: 30
  buzz_map_mensili: 0
  final_shot: "Solo visibile primo livello indizi"
  indizi_base: true
  mappa_base: false
  notifiche_push: false
  early_access_missioni: false
  memoria_ai: "Nessuna memoria persistente"
  
limiti:
  cooldown_buzz: "24 ore tra BUZZ"
  cooldown_buzz_map: "Non disponibile"
  supporto: "Solo FAQ"
  ads: "Pubblicità attive"
  
upgrade_incentive:
  messaggio: "Passa a Silver per sbloccare 3 BUZZ/settimana, pillole AI Norah e zero pubblicità!"
```

---

## Silver Tier

```yaml
pricing:
  costo_mensile: 3,99€
  costo_annuale: 39,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_incluse:
  buzz_settimanali: 3
  buzz_mensili: 90
  buzz_map_mensili: 0
  final_shot: "Indizi livello 1+2, nessuna anticipazione"
  indizi_premium: "Livello 1-2"
  mappa_delay: "Aggiornamento 24h"
  badge_silver: true
  supporto: "Ticket email"
  ads: false
  memoria_ai: "Nessuna memoria persistente"
  notifiche_push: "Micro-celebrazioni + pillole AI Norah sempre attive"
  
limiti:
  cooldown_buzz: "12 ore tra BUZZ"
  cooldown_buzz_map: "Non disponibile"
  
benefits_esclusivi:
    - "3 BUZZ a settimana"
    - "Indizi livello 1+2"
    - "Zero pubblicità"
    - "Pillole AI Norah sempre attive"
```

---

## Gold Tier

```yaml
pricing:
  costo_mensile: 6,99€
  costo_annuale: 69,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_incluse:
  buzz_settimanali: 4
  buzz_mensili: 150
  buzz_map_mensili: 0
  final_shot: "Disponibile a metà missione"
  indizi_premium: "Livello 1-3"
  mappa_delay: "Aggiornamento 12h"
  badge_gold: true
  supporto: "Live chat"
  ads: false
  notifiche_push: "Notifiche push premium"
  memoria_ai: "Memoria AI breve (sessione + ultima settimana)"
  
limiti:
  cooldown_buzz: "8 ore tra BUZZ"
  cooldown_buzz_map: "Non disponibile"
  
benefits_esclusivi:
    - "4 BUZZ a settimana"
    - "Final Shot disponibile a metà missione"
    - "Indizi livello 1-3"
    - "Memoria AI sessione + settimana"
    - "Mappe delay 12h"
```

---

## Black Tier (VIP)

```yaml
pricing:
  costo_mensile: 9,99€
  costo_annuale: 99,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_incluse:
  buzz_settimanali: 5
  buzz_mensili: 200
  buzz_map_mensili: 1
  final_shot: "Disponibile in qualsiasi momento"
  indizi_premium: "Livello 1-4"
  mappa_delay: "Aggiornamento quasi real-time (2h)"
  badge_black: true
  supporto: "Live chat + priorità"
  ads: false
  memoria_ai: "Memoria AI completa (storico indizi, progressi personali)"
  vantaggi_luxury: "Vantaggi esclusivi su premi luxury (auto, orologi)"
  
limiti:
  cooldown_buzz: "4 ore tra BUZZ"
  cooldown_buzz_map: "30 giorni tra BUZZ Map (1 al mese)"
  
benefits_esclusivi:
    - "5 BUZZ a settimana"
    - "1 BUZZ Map al mese"
    - "Final Shot sempre disponibile"
    - "Indizi livello 1-4"
    - "Memoria AI completa"
    - "Mappe quasi real-time (delay 2h)"
    - "Vantaggi su premi luxury"
```

---

## Titanium Tier (PREMIUM MAX)

```yaml
pricing:
  costo_mensile: 29,99€
  costo_annuale: 299,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_incluse:
  buzz_settimanali: 7
  buzz_mensili: 280
  buzz_map_mensili: 2
  final_shot: "Potenziato con suggerimenti Norah AI"
  indizi_premium: "Completo, livello 1-5"
  mappa_delay: "Real-time"
  badge_titanium: true
  supporto: "Concierge 24/7"
  ads: false
  memoria_ai: "Memoria AI predittiva (profilo + suggerimenti personalizzati)"
  eventi_esclusivi: "Eventi e premi riservati Titanium Only"
  badge_classifica: "Badge speciale in classifica"
  
limiti:
  cooldown_buzz: "Nessuno (può usare 7 BUZZ quando vuole)"
  cooldown_buzz_map: "15 giorni tra BUZZ Map (2 al mese)"
  
benefits_esclusivi:
    - "7 BUZZ a settimana senza cooldown"
    - "2 BUZZ Map al mese"
    - "Final Shot potenziato con suggerimenti Norah AI"
    - "Indizi completi livello 1-5"
    - "Memoria AI predittiva"
    - "Mappe real-time"
    - "Eventi Titanium Only"
    - "Badge speciale classifica"
    - "Concierge 24/7"
```

---

## Confronto Rapido

| Feature | Free | Silver | Gold | Black | Titanium |
|---------|------|--------|------|-------|----------|
| Prezzo | 0€ | 3,99€/m | 6,99€/m | 9,99€/m | 29,99€/m |
| BUZZ/settimana | 1 | 3 | 4 | 5 | 7 |
| BUZZ/mese | 30 | 90 | 150 | 200 | 280 |
| BUZZ Map/mese | 0 | 0 | 0 | 1 | 2 |
| Final Shot | Base | Base | Metà missione | Sempre | Potenziato AI |
| Cooldown BUZZ | 24h | 12h | 8h | 4h | Nessuno |
| Indizi | Lv 1 | Lv 1-2 | Lv 1-3 | Lv 1-4 | Lv 1-5 |
| Memoria AI | No | No | Breve | Completa | Predittiva |
| Mappe delay | - | 24h | 12h | 2h | Real-time |
| Supporto | FAQ | Email | Live chat | Chat priority | Concierge 24/7 |
| Ads | Sì | No | No | No | No |

---

## Upgrade Paths & Incentivi

### Free → Silver
```yaml
trigger_moment:
  - "Utente ha esaurito BUZZ settimanali"
  - "Vuole più indizi (bloccato a livello 1)"
  - "Vede pubblicità troppo frequenti"
  
messaggio_tipo: "Passa a Silver: 3 BUZZ/settimana, indizi livello 2, zero pubblicità!"
conversion_rate_target: 18%
```

### Silver → Gold
```yaml
trigger_moment:
  - "Utente power user (usa tutti i 3 BUZZ settimanali)"
  - "Vuole Final Shot a metà missione"
  - "Interessato a indizi livello 3"
  
messaggio_tipo: "Diventa Gold: 4 BUZZ/settimana + Final Shot a metà missione!"
conversion_rate_target: 12%
```

### Gold → Black
```yaml
trigger_moment:
  - "Utente super engaged (usa 4 BUZZ ogni settimana)"
  - "Vuole provare BUZZ Map"
  - "Interessato a memoria AI completa"
  
messaggio_tipo: "Black Tier: 5 BUZZ/settimana + 1 BUZZ Map al mese + memoria AI!"
conversion_rate_target: 8%
```

### Black → Titanium
```yaml
trigger_moment:
  - "Utente usa il BUZZ Map del mese immediatamente"
  - "Daily active da almeno 60 giorni"
  - "Vuole Final Shot potenziato AI"
  
messaggio_tipo: "Titanium: 7 BUZZ senza cooldown + 2 BUZZ Map + AI predittiva!"
conversion_rate_target: 5%
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
A: No, Black ha 5 BUZZ a settimana (200/mese). Solo Titanium può usare 7 BUZZ senza cooldown.

**Q: Quali metodi di pagamento accettate?**  
A: Stripe: carta credito/debito, Apple Pay, Google Pay, bonifico SEPA.

**Q: C'è trial gratuito per i tier a pagamento?**  
A: Sì, 7 giorni trial gratuito per Silver e Gold. 3 giorni trial per Black e Titanium.

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
