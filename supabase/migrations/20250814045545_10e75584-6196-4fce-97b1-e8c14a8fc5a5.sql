-- Enable authenticated users to read their QR redemption logs
-- This is needed to show "claimed" status on map markers

DROP POLICY IF EXISTS qr_redemption_logs_select_own ON public.qr_redemption_logs;

CREATE POLICY qr_redemption_logs_select_own
ON public.qr_redemption_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);