-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO INSERT THE PRESENTATION MOCK DECKS
-- Ensure you replace the 'your-demo-user-id' with an actual user UUID if you want them assigned to your login.
-- These default to NULL user if not specified, but decks usually require a user_id. 
-- We will assign them to the first user in the profiles table.

DO $$
DECLARE
    v_user_id UUID;
    v_deck_id_1 UUID := gen_random_uuid();
    v_deck_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get the first user available (or define yours explicitly)
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in public.profiles. Please register at least one user before seeding decks.';
    END IF;

    -- DECK 1: MinDeck App Features (Presentazione features App)
    INSERT INTO public.decks (id, user_id, title, subject, is_public, cards, created_at)
    VALUES (
        v_deck_id_1,
        v_user_id,
        'Presentazione: Perché scegliere MinDeck',
        'Business/Pitch',
        true,
        '[
            {"front": "Cos''è MinDeck?", "back": "L''app definitiva per creare, studiare e condividere Flashcards con l''intelligenza artificiale integrata."},
            {"front": "Qual è il vantaggio competitivo dell''AI?", "back": "Generazione istantanea di mazzi da testo e controllo qualità automatizzato, risparmiando l''80% del tempo."},
            {"front": "Perché le aziende o accademie dovrebbero usarla?", "back": "Per l''onboarding rapido, formazione continua dei dipendenti e verifica delle competenze tramite micro-learning."},
            {"front": "Quale framework usa?", "back": "MinDeck sfrutta serverless cloud via Supabase, Next.js per il Web e integrazione nativa Cross-Platform per mobile."},
            {"front": "Il sistema è scalabile?", "back": "Sì, grazie all''infrastruttura edge, l''app scala automaticamente per supportare da 1 a milioni di utenti."}
        ]'::jsonb,
        now() - INTERVAL '1 day'
    );

    -- DECK 2: IT Security Basics (Esempio Aziendale)
    INSERT INTO public.decks (id, user_id, title, subject, is_public, cards, created_at)
    VALUES (
        v_deck_id_2,
        v_user_id,
        'Sicurezza Informatica (Onboarding Aziendale)',
        'IT Security',
        true,
        '[
            {"front": "Cos''è il Phishing?", "back": "Un tentativo di rubare credenziali tramite email contraffatte che sembrano provenire da entità affidabili."},
            {"front": "Regola base per le password?", "back": "Usare almeno 12 caratteri, alfanumerici, e cambiarla ogni 90 giorni (o usare password manager)."},
            {"front": "Cosa significa MFA?", "back": "Multi-Factor Authentication: un secondo livello di sicurezza (es. SMS o App Code) oltre alla password."},
            {"front": "Come trattare i dati sensibili (GDPR)?", "back": "Non inviare mai file contenenti PII via canali non crittografati e limitare l''accesso a chi ha stretta necessità (Need to know)."},
            {"front": "Cosa fare se smarrisci il laptop aziendale?", "back": "Segnalarlo immediatamente all''IT per avviare il reset da remoto e bloccare gli account VPN."}
        ]'::jsonb,
        now()
    );

    -- Aggiungiamo 5 Stelle automaticamente (mock) se v_user_id è valido
    INSERT INTO public.stars (user_id, deck_id) VALUES (v_user_id, v_deck_id_1) ON CONFLICT DO NOTHING;
    INSERT INTO public.stars (user_id, deck_id) VALUES (v_user_id, v_deck_id_2) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Decks inserted successfully!';
END $$;
