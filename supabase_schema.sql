-- Create decks table with optimized JSONB storage for cards
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  cards JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false, -- New column for privacy settings
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- Policies for decks
CREATE POLICY "Users can view their own decks" 
ON public.decks FOR SELECT 
USING (auth.uid() = user_id OR is_public = true); -- Allow viewing if owner OR if deck is public

CREATE POLICY "Users can insert their own decks" 
ON public.decks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
ON public.decks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
ON public.decks FOR DELETE 
USING (auth.uid() = user_id);
