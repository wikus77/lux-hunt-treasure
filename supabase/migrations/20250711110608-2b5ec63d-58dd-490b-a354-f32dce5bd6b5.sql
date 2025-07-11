-- by Joseph Mulé – M1SSION™
-- Pulizia notifiche con marca esplicita e inserimento test corretto

-- Elimina notifiche che rivelano esplicitamente la marca del premio
DELETE FROM user_notifications 
WHERE message LIKE '%PORSCHE%' 
   OR message LIKE '%CAYENNE%' 
   OR message LIKE '%BMW%' 
   OR message LIKE '%MERCEDES%'
   OR message LIKE '%AUDI%';

-- Inserisce notifica test corretta senza marca esplicita
INSERT INTO user_notifications (user_id, title, message, type, is_read)
VALUES (
  '495246c1-9154-4f01-a428-7f37fe230180',
  '🧩 Nuovo indizio M1SSION™',
  'Quattro ruote di lusso attendono nella terra dei templi, dove la storia millenaria incontra il presente.',
  'clue',
  false
);

-- Log dell'intervento correttivo
INSERT INTO admin_logs (user_id, event_type, context, note, device)
VALUES (
  '495246c1-9154-4f01-a428-7f37fe230180',
  'clue_correction_applied',
  'Sistema BUZZ_CLUE_ENGINE corretto: eliminati indizi con marca esplicita',
  'Logica narrativa M1SSION™ ripristinata - mai rivelare marca/modello nei prize clues',
  'manual_intervention'
);