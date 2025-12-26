-- 🔄 RESET PUSH NOTIFICATION LIMITS FOR TESTING
-- Esegui questo SQL dalla Supabase Dashboard → SQL Editor
-- © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™

-- 1. Mostra i log di oggi PRIMA del reset
SELECT 
    user_id,
    COUNT(*) as notifiche_oggi,
    MAX(details->>'sent_at') as ultima_notifica
FROM auto_push_log 
WHERE sent_date = CURRENT_DATE
GROUP BY user_id
ORDER BY notifiche_oggi DESC
LIMIT 10;

-- 2. RESET: Cancella i log di OGGI per permettere nuove notifiche
DELETE FROM auto_push_log 
WHERE sent_date = CURRENT_DATE;

-- 3. Conferma che i log sono stati cancellati
SELECT COUNT(*) as log_rimanenti_oggi FROM auto_push_log WHERE sent_date = CURRENT_DATE;

-- Ora puoi eseguire il cron job di test e riceverai la notifica!







