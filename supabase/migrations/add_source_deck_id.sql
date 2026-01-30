-- Aggiunge la colonna source_deck_id alla tabella decks
-- Questa colonna serve a tracciare l'origine dei mazzi scaricati
-- e impedire download duplicati.

ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS source_deck_id TEXT;

-- Indice per velocizzare il controllo dei mazzi già scaricati dall'utente
CREATE INDEX IF NOT EXISTS idx_decks_user_source 
ON public.decks (user_id, source_deck_id);
