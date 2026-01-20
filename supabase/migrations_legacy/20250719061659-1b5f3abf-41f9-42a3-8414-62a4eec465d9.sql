-- Create table for AI generated content
CREATE TABLE public.ai_generated_clues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID,
  content_type TEXT NOT NULL CHECK (content_type IN ('clue', 'mission', 'story')),
  title TEXT,
  content TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  language TEXT DEFAULT 'it',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generated_clues ENABLE ROW LEVEL SECURITY;

-- Create policies for AI generated content
CREATE POLICY "Users can view their own AI content" 
ON public.ai_generated_clues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI content" 
ON public.ai_generated_clues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI content" 
ON public.ai_generated_clues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI content" 
ON public.ai_generated_clues 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can access all AI content
CREATE POLICY "Admins can view all AI content" 
ON public.ai_generated_clues 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can manage all AI content" 
ON public.ai_generated_clues 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_generated_clues_updated_at
BEFORE UPDATE ON public.ai_generated_clues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();