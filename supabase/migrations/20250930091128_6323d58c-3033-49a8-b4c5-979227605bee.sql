-- Add prize relationship to missions table
ALTER TABLE public.missions ADD COLUMN prize_id uuid REFERENCES public.prizes(id);

-- Add additional mission fields for enhanced functionality
ALTER TABLE public.missions ADD COLUMN start_date timestamp with time zone;
ALTER TABLE public.missions ADD COLUMN end_date timestamp with time zone;

-- Add prize details fields that missions can override
ALTER TABLE public.missions ADD COLUMN prize_description text;
ALTER TABLE public.missions ADD COLUMN prize_value text;
ALTER TABLE public.missions ADD COLUMN prize_image_url text;

-- Enable realtime for user_mission_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_mission_registrations;

-- Set replica identity for proper realtime updates
ALTER TABLE public.user_mission_registrations REPLICA IDENTITY FULL;