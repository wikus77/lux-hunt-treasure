-- DNA Mind Fractal: Nodes & Links Tracking
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- dna_mf_links: collegamenti creati dall'utente tra due nodi
CREATE TABLE IF NOT EXISTS dna_mf_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed bigint NOT NULL,
  node_from text NOT NULL,
  node_to text NOT NULL,
  length numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- dna_mf_nodes_seen: primi click/visite di nodi (per progress %)
CREATE TABLE IF NOT EXISTS dna_mf_nodes_seen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed bigint NOT NULL,
  node_id text NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, seed, node_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_mf_links_user_seed ON dna_mf_links(user_id, seed);
CREATE INDEX IF NOT EXISTS idx_mf_nodes_user_seed ON dna_mf_nodes_seen(user_id, seed);

-- RLS
ALTER TABLE dna_mf_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_mf_nodes_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mf_links_select" ON dna_mf_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mf_links_insert" ON dna_mf_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mf_seen_select" ON dna_mf_nodes_seen
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mf_seen_insert" ON dna_mf_nodes_seen
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC per batch upsert nodi visti
CREATE OR REPLACE FUNCTION mf_upsert_seen(p_node_ids text[], p_seed bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dna_mf_nodes_seen (user_id, seed, node_id)
  SELECT auth.uid(), p_seed, unnest(p_node_ids)
  ON CONFLICT (user_id, seed, node_id) DO NOTHING;
END;
$$;

-- RPC per aggiungere link
CREATE OR REPLACE FUNCTION mf_add_link(p_from text, p_to text, p_length numeric, p_seed bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO dna_mf_links (user_id, seed, node_from, node_to, length)
  VALUES (auth.uid(), p_seed, p_from, p_to, p_length);
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mf_upsert_seen TO authenticated;
GRANT EXECUTE ON FUNCTION mf_add_link TO authenticated;

COMMENT ON TABLE dna_mf_links IS 'Tracks user-created links between nodes in Mind Fractal';
COMMENT ON TABLE dna_mf_nodes_seen IS 'Tracks discovered nodes for progress calculation';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™