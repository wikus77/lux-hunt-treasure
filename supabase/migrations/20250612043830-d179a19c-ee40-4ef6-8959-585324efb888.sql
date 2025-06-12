
-- Aggiungi il campo action alla tabella buzz_logs
ALTER TABLE public.buzz_logs 
ADD COLUMN action TEXT;

-- Verifica che la tabella abbia RLS abilitato (dovrebbe già essere così)
-- Se non fosse abilitato, decommentare la riga seguente:
-- ALTER TABLE public.buzz_logs ENABLE ROW LEVEL SECURITY;
