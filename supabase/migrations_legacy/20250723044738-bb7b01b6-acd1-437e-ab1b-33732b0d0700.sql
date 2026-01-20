-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Add terms_accepted column to user_consents table

ALTER TABLE public.user_consents 
ADD COLUMN terms_accepted boolean DEFAULT false;