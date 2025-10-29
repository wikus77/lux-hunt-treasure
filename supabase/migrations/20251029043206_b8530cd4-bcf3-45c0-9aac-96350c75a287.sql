-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Add agent_dna tables to realtime publication

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE agent_dna;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_dna_events;

-- Verify tables are in publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND tablename='agent_dna'
  ) THEN
    RAISE EXCEPTION 'agent_dna not added to supabase_realtime publication';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname='supabase_realtime' AND tablename='agent_dna_events'
  ) THEN
    RAISE EXCEPTION 'agent_dna_events not added to supabase_realtime publication';
  END IF;
  
  RAISE NOTICE 'DNA tables successfully added to realtime publication';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™