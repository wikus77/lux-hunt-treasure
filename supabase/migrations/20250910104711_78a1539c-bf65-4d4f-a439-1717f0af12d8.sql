-- Fix RLS security issue for feed_scoring_stats table
-- DO NOT TOUCH PUSH CHAIN

ALTER TABLE public.feed_scoring_stats ENABLE ROW LEVEL SECURITY;