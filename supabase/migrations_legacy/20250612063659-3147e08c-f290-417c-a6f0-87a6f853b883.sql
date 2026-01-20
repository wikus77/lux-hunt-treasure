
-- Create the videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the videos bucket to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow public uploads to the videos bucket (optional, for future uploads)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Allow public updates to the videos bucket (optional, for future updates)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');
