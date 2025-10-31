-- Migration: Create agent_ranks table with Hierarchy v2.0
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Create table
CREATE TABLE IF NOT EXISTS public.agent_ranks (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_it TEXT NOT NULL,
  description TEXT,
  pe_min INT NOT NULL,
  pe_max INT,
  color TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_ranks_pe_range ON agent_ranks (pe_min, pe_max);
CREATE INDEX IF NOT EXISTS idx_agent_ranks_code ON agent_ranks (code);

-- Seed data: Gerarchia M1SSION v2.0
INSERT INTO agent_ranks (code, name_en, name_it, description, pe_min, pe_max, color, symbol) VALUES
('AG-01', 'Recruit', 'Recluta', 'Nuovo agente in addestramento', 0, 999, '#808080', '🎖️'),
('AG-02', 'Field Agent', 'Agente sul Campo', 'Operativo base certificato', 1000, 2499, '#4A90E2', '🔰'),
('OP-03', 'Operative', 'Operativo', 'Agente esperto con missioni completate', 2500, 4999, '#50C878', '⚡'),
('SP-04', 'Specialist', 'Specialista', 'Esperto in tecniche avanzate', 5000, 9999, '#9370DB', '🎯'),
('SH-05', 'Shadow Operative', 'Operativo Ombra', 'Elite nell''infiltrazione', 10000, 19999, '#2F4F4F', '👁️'),
('EA-06', 'Elite Agent', 'Agente Elite', 'Top 5% degli agenti', 20000, 39999, '#FFD700', '⭐'),
('CM-07', 'Commander', 'Comandante', 'Leader di squadre operative', 40000, 79999, '#FF6347', '🎖️'),
('DR-08', 'Director', 'Direttore', 'Gestione strategica nazionale', 80000, 149999, '#8B0000', '🏆'),
('GM-09', 'Grand Master', 'Gran Maestro', 'Leggenda vivente del network', 150000, 299999, '#4B0082', '👑'),
('M1-10', 'Master', 'Maestro', 'Vertice della gerarchia', 300000, NULL, '#000080', '💎'),
('SRC-∞', 'MCP - Master Control Program', 'MCP - Programma di Controllo Principale', 'Grado riservato a Joseph Mulé', 999999999, NULL, '#FF0000', '🔺')
ON CONFLICT (code) DO NOTHING;

-- RLS Policies
ALTER TABLE agent_ranks ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS agent_ranks_public_read ON agent_ranks;
CREATE POLICY agent_ranks_public_read ON agent_ranks
  FOR SELECT USING (true);

-- Admin write only
DROP POLICY IF EXISTS agent_ranks_admin_write ON agent_ranks;
CREATE POLICY agent_ranks_admin_write ON agent_ranks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
