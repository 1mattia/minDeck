-- ==========================================
-- 1. CREAZIONE TABELLE (ORDINE CORRETTO)
-- ==========================================

-- Tabella Profili (deve esistere prima di Mazzi per i riferimenti FK)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella Mazzi (riferisce Profiles)
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  cards JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella Stelle (preferiti)
CREATE TABLE IF NOT EXISTS public.stars (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  deck_id UUID REFERENCES public.decks ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, deck_id)
);

-- ==========================================
-- 2. SICUREZZA (Row Level Security)
-- ==========================================

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

-- Mazzi: Visibili se proprietari o esterni ma pubblici
CREATE POLICY "Users can view their own decks or public ones" 
ON public.decks FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own decks" 
ON public.decks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
ON public.decks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
ON public.decks FOR DELETE USING (auth.uid() = user_id);

-- Profili: Visibili a tutti, modificabili solo dal proprietario
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can edit their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stelle: Visibili a tutti
CREATE POLICY "Stars are viewable by everyone" 
ON public.stars FOR SELECT USING (true);

CREATE POLICY "Authenticated users can star decks" 
ON public.stars FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar their own stars" 
ON public.stars FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. AUTOMATISMI (Trigger e Funzioni)
-- ==========================================

-- Crea automaticamente un profilo quando si registra un nuovo utente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per la creazione del profilo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronizza eventuali utenti esistenti che non hanno un profilo
INSERT INTO public.profiles (id, display_name)
SELECT id, split_part(email, '@', 1)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
