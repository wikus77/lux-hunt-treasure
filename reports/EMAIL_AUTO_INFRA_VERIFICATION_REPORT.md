# Verifica email auto infra (read-only)

**Progetto:** vkjrqirvdvjbemsfzxof  
**Ambiente:** App nativa iOS (Capacitor WKWebView)  
**Scope:** Solo verifica. Nessuna modifica, nessuna migration applicata, nessun deploy.  
**© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™**

---

## Come eseguire la verifica

1. **Database:** Supabase Dashboard → SQL Editor → esegui le query in `reports/verify_email_auto_infra.sql` in ordine.  
   Per il **CONFIG (query 5):** esegui prima la **5a** (sempre sicura). Se `config_table_exists` = false, segna nel report: row = NO, base_url = NULL, auth_token = NULL. Se true, esegui anche la **5b** per ottenere row_exists / base_url_status / auth_token_status.

2. **Edge Functions:** Dashboard → Edge Functions oppure da terminale:  
   `supabase functions list`  
   Controllare se compaiono `send-marker-prize-email` e `send-final-shoot-winner-email`.

---

## Output finale (compilare dopo le query)

```
TABLES
- email_sends: YES / NO
- email_send_config: YES / NO
- prize_claims: YES / NO
- final_shoot_winners: YES / NO

TRIGGERS
- trigger_email_marker_physical_prize: YES / NO  (tabella: prize_claims, funzione: queue_and_invoke_marker_prize_email, attivo: YES/NO)
- trigger_email_final_shoot_winner: YES / NO     (tabella: final_shoot_winners, funzione: queue_and_invoke_final_shoot_winner_email, attivo: YES/NO)

FUNCTIONS
- queue_and_invoke_marker_prize_email: YES / NO  (SECURITY DEFINER: YES/NO)
- queue_and_invoke_final_shoot_winner_email: YES / NO  (SECURITY DEFINER: YES/NO)

EXTENSION
- pg_net: YES / NO

CONFIG (tabella email_send_config)
- email_send_config row: YES / NO
- base_url: SET / NULL
- auth_token: SET / NULL   (non mostrare il valore)

EDGE
- send-marker-prize-email: DEPLOYED / NOT FOUND
- send-final-shoot-winner-email: DEPLOYED / NOT FOUND
```

---

## Riepilogo azioni (read-only)

| # | Cosa | Dove |
|---|------|------|
| 1 | Tabelle: esistenza + colonne principali | Query 1 in `verify_email_auto_infra.sql` |
| 2 | Trigger: nome, tabella, funzione, attivo | Query 2 |
| 3 | Funzioni SQL: esistenza + SECURITY DEFINER | Query 3 |
| 4 | Estensione pg_net | Query 4 |
| 5 | email_send_config: riga, base_url, auth_token (SET/NULL, senza valore) | Query 5 |
| 6 | Edge Functions deployate | Dashboard o `supabase functions list` |

---

**Nota:** auth_token non va mai stampato o loggato; in CONFIG indicare solo se è valorizzato (SET) o meno (NULL).
