-- © 2025 Joseph MULÉ – M1SSION™ – P0 Closeout to 100%
-- Grant espliciti su VIEW pubbliche + payment_transactions stub

-- TASK A: GRANT espliciti su VIEW pubbliche
GRANT SELECT ON public_profiles TO anon, authenticated;
GRANT SELECT ON winners_public TO anon, authenticated;

-- TASK B: payment_transactions stub + RLS hardening (elimina warning)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_ref text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT
CREATE POLICY "Users select own payments"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin override
CREATE POLICY "Admins can select all payments"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™