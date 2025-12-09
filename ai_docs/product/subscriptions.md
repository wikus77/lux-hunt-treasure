# Subscription Tiers — M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 2.0  
**Last Updated:** 2025-12-07  
**Status:** OFFICIAL PRODUCT BIBLE - ALLINEATO CON IMPLEMENTAZIONE

---

## Overview Tier System

M1SSION™ offre 5 tier di abbonamento, ciascuno con feature e limiti progressivi per ottimizzare l'esperienza di gioco.

---

## 📊 Tabella Riepilogativa — FEATURE ATTIVE

Questa tabella contiene SOLO le feature attualmente implementate e funzionanti.

| Feature | Free | Silver | Gold | Black | Titanium |
|---------|------|--------|------|-------|----------|
| **Prezzo** | 0€ | 3,99€/m | 6,99€/m | 9,99€/m | 29,99€/m |
| **BUZZ gratuiti/settimana** | 1 | 3 | 4 | 5 | 7 |
| **BUZZ MAP inclusi/mese** | 0 | 0 | 0 | 1 | 2 |
| **Cooldown BUZZ MAP** | 24h | 12h | 8h | 4h | 0h (nessuno) |
| **Indizi/settimana** | 1 | 3 | 5 | 7 | 7 |
| **Livelli indizi** | Lv 1 | Lv 1-2 | Lv 1-3 | Lv 1-4 | Lv 1-5 (tutti) |
| **Badge profilo** | - | Silver | Gold | Black | Titanium |

---

## Free Tier (Base)

```yaml
pricing:
  costo_mensile: 0€
  costo_annuale: 0€
  
feature_attive:
  buzz_gratuiti_settimana: 1
  buzz_map_mensili: 0  # Solo a pagamento
  cooldown_buzz_map: 24h
  indizi_settimana: 1
  livelli_indizi: [1]
  badge: null
  
note: "Accesso base alla missione. BUZZ MAP disponibili a pagamento con pricing progressivo."
```

---

## Silver Tier

```yaml
pricing:
  costo_mensile: 3,99€
  costo_annuale: 39,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_attive:
  buzz_gratuiti_settimana: 3
  buzz_map_mensili: 0  # Solo a pagamento
  cooldown_buzz_map: 12h
  indizi_settimana: 3
  livelli_indizi: [1, 2]
  badge: "Silver"
  
benefits:
  - "3 BUZZ gratuiti a settimana"
  - "3 indizi a settimana (Livelli 1-2)"
  - "Cooldown BUZZ MAP ridotto a 12h"
  - "Badge Silver nel profilo"
```

---

## Gold Tier

```yaml
pricing:
  costo_mensile: 6,99€
  costo_annuale: 69,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_attive:
  buzz_gratuiti_settimana: 4
  buzz_map_mensili: 0  # Solo a pagamento
  cooldown_buzz_map: 8h
  indizi_settimana: 5
  livelli_indizi: [1, 2, 3]
  badge: "Gold"
  
benefits:
  - "4 BUZZ gratuiti a settimana"
  - "5 indizi a settimana (Livelli 1-3)"
  - "Cooldown BUZZ MAP ridotto a 8h"
  - "Badge Gold nel profilo"
```

---

## Black Tier (VIP)

```yaml
pricing:
  costo_mensile: 9,99€
  costo_annuale: 99,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_attive:
  buzz_gratuiti_settimana: 5
  buzz_map_mensili: 1  # INCLUSA nel tier
  cooldown_buzz_map: 4h
  indizi_settimana: 7
  livelli_indizi: [1, 2, 3, 4]
  badge: "Black"
  
benefits:
  - "5 BUZZ gratuiti a settimana"
  - "7 indizi a settimana (Livelli 1-4)"
  - "1 BUZZ MAP inclusa al mese"
  - "Cooldown BUZZ MAP: solo 4h"
  - "Badge Black nel profilo"
```

---

## Titanium Tier (PREMIUM MAX)

```yaml
pricing:
  costo_mensile: 29,99€
  costo_annuale: 299,99€ (2 mesi gratis)
  risparmio_annuale: 16%
  
feature_attive:
  buzz_gratuiti_settimana: 7
  buzz_map_mensili: 2  # INCLUSE nel tier
  cooldown_buzz_map: 0h  # Nessun cooldown
  indizi_settimana: 7
  livelli_indizi: [1, 2, 3, 4, 5]  # Tutti i livelli
  badge: "Titanium"
  
benefits:
  - "7 BUZZ gratuiti a settimana"
  - "7 indizi a settimana (tutti i Livelli 1-5)"
  - "2 BUZZ MAP incluse al mese"
  - "BUZZ MAP senza cooldown"
  - "Badge Titanium esclusivo"
  - "Accesso prioritario alle novità M1SSION™"
```

---

## Priorità Utilizzo BUZZ

Quando un utente preme il tasto BUZZ, il sistema segue questa priorità:

1. **BUZZ gratuiti settimanali del tier** → Se disponibili, vengono usati per primi
2. **BUZZ da premi (grants)** → BUZZ ottenuti da marker rewards, XP, etc.
3. **Pricing progressivo M1U** → Se non ha BUZZ gratuiti, paga con M1U

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

**Q: Quanti BUZZ gratuiti ho a settimana?**  
A: Dipende dal tuo tier: Free=1, Silver=3, Gold=4, Black=5, Titanium=7.

**Q: Come funziona la priorità BUZZ?**  
A: Prima usi i BUZZ gratuiti del tier, poi i grants (premi), poi paghi con M1U.

**Q: Cosa succede se esaurisco i BUZZ gratuiti?**  
A: Puoi continuare a fare BUZZ pagando con M1U (pricing progressivo) o attendere il reset settimanale.

**Q: Posso cambiare tier in qualsiasi momento?**  
A: Sì, upgrade immediato. Downgrade effettivo a fine periodo già pagato.

**Q: Il Black Tier ha BUZZ MAP incluse?**  
A: Sì, Black ha 1 BUZZ MAP gratuita al mese. Titanium ne ha 2.

**Q: Qual è il cooldown BUZZ MAP per ogni tier?**  
A: Free=24h, Silver=12h, Gold=8h, Black=4h, Titanium=0h (nessun cooldown).

**Q: Quali metodi di pagamento accettate?**  
A: Stripe: carta credito/debito, Apple Pay, Google Pay, bonifico SEPA.

---

## 🚧 Funzionalità Pianificate (NON ancora attive)

Le seguenti feature sono documentate per riferimento futuro ma **NON sono ancora implementate**:

| Feature | Stato | Note |
|---------|-------|------|
| Memoria AI differenziata per tier | 🔜 PIANIFICATA | Free=No, Gold=Breve, Black=Completa, Titanium=Predittiva |
| Supporto differenziato | 🔜 PIANIFICATA | FAQ → Email → Live Chat → Concierge |
| Pubblicità tier Free | 🔜 PIANIFICATA | Ads solo per Free, no ads per tier paganti |
| Early access missioni (ore) | 🔜 PIANIFICATA | Silver=2h, Gold=12h, Black=24h, Titanium=48h |
| Mappe delay differenziato | 🔜 PIANIFICATA | Silver=24h, Gold=12h, Black=2h, Titanium=Real-time |
| Badge visuale nel profilo | 🔜 IN SVILUPPO | Testo presente, grafica da implementare |

⚠️ **IMPORTANTE**: Queste feature NON devono essere comunicate agli utenti come attive finché non sono implementate.

---

## Note per Developer

- **File configurazione tier**: `src/config/tierLimits.ts`
- **Distribuzione indizi**: `src/utils/ClueDistributor.ts`
- **Hook BUZZ gratuiti settimanali**: `src/hooks/useTierFreeBuzz.ts`
- **Hook BUZZ MAP mensili**: `src/hooks/useTierBuzzMapMonthly.ts`
- **Tabella DB BUZZ settimanali**: `user_buzz_weekly`
- **Tabella DB BUZZ MAP mensili**: `user_buzzmap_monthly`
- **Verifica tier**: `get_active_subscription(user_id)` 
- **Stripe integration**: Webhook `checkout.session.completed` per attivazione

---

**IMPORTANT:** L'assistente AI deve sempre fare riferimento a questo documento per informazioni su tiers. Le feature nella sezione "Pianificate" NON devono essere presentate come attive.

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
