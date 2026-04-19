'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Download, CheckCircle2, Loader2, Eye, X } from 'lucide-react'
import Logo from '@/components/Logo'

interface Deck {
    id: string;
    title: string;
    subject: string;
    icon?: string;
    cards: { question: string; answer: string }[];
    isExternal?: boolean;
}

const DECKS: Deck[] = [
    {
        "id": "math_complete",
        "title": "Matematica Completa",
        "subject": "Matematica",
        "icon": "Aritmetica",
        "cards": [
            { "question": "Quanto fa 2 + 2?", "answer": "4" },
            { "question": "Quanto fa 5 + 7?", "answer": "12" },
            { "question": "Quanto fa 10 - 3?", "answer": "7" },
            { "question": "Quanto fa 4 × 6?", "answer": "24" },
            { "question": "Quanto fa 20 ÷ 4?", "answer": "5" },
            { "question": "Qual è la radice quadrata di 16?", "answer": "4" },
            { "question": "Quanto fa 3²?", "answer": "9" }
        ]
    },
    {
        "id": "history_italy",
        "title": "Storia d'Italia",
        "subject": "Storia",
        "icon": "Risorgimento",
        "cards": [
            { "question": "In che anno è stata proclamata l'Unità d'Italia?", "answer": "1861" },
            { "question": "Chi era il primo Re d'Italia?", "answer": "Vittorio Emanuele II" },
            { "question": "Chi guidò la spedizione dei Mille?", "answer": "Giuseppe Garibaldi" }
        ]
    },
    {
        "id": "coding_basics",
        "title": "Programmazione Base",
        "subject": "Informatica",
        "icon": "JS/Python",
        "cards": [
            { "question": "Cosa significa HTML?", "answer": "HyperText Markup Language" },
            { "question": "Cosa sono le variabili?", "answer": "Contenitori per memorizzare dati" },
            { "question": "A cosa serve un ciclo 'for'?", "answer": "A ripetere un blocco di codice più volte" }
        ]
    }
]

export default function ImportPage() {
    const [dbDecks, setDbDecks] = useState<any[]>([])
    const [importingId, setImportingId] = useState<string | null>(null)
    const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
    const [importedSourceIds, setImportedSourceIds] = useState<Map<string, { id: string, cards: any[] }>>(new Map())
    const [previewDeck, setPreviewDeck] = useState<Deck | null>(null)
    const [activeCategory, setActiveCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadInitialData() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            // Fetch public decks
            const { data } = await supabase
                .from('decks')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })

            setDbDecks(data || [])

            // Fetch user's imported decks
            if (user) {
                const { data: userDecks } = await supabase
                    .from('decks')
                    .select('id, source_deck_id, cards')
                    .eq('user_id', user.id)
                    .not('source_deck_id', 'is', null)

                if (userDecks) {
                    const map = new Map()
                    userDecks.forEach(d => map.set(d.source_deck_id, { id: d.id, cards: d.cards }))
                    setImportedSourceIds(map)
                }
            }

            setLoading(false)
        }
        loadInitialData()
    }, [])

    // Merge static presets with DB decks for the gallery
    const allDecks = [...DECKS, ...dbDecks.map(d => ({
        id: d.id,
        title: d.title,
        subject: d.subject,
        cards: d.cards,
        isExternal: true
    }))]

    const categories = ['All', ...Array.from(new Set(allDecks.map(d => d.subject)))]

    const filteredDecks = activeCategory === 'All'
        ? allDecks
        : allDecks.filter(d => d.subject === activeCategory)

    const handleImport = async (deckToImport: Deck) => {
        if (!user) {
            router.push('/login')
            return
        }

        if (importedIds.has(deckToImport.id) || importedSourceIds.has(deckToImport.id)) {
            const existing = importedSourceIds.get(deckToImport.id)
            if (existing && deckToImport.cards.length > existing.cards.length) {
                await handleSync(deckToImport)
            }
            return
        }

        setImportingId(deckToImport.id)

        const { error: deckError } = await supabase
            .from('decks')
            .insert({
                user_id: user.id,
                title: deckToImport.title,
                subject: deckToImport.subject,
                cards: deckToImport.cards,
                is_public: false, // Cloned mazzi are private by default for the new owner
                source_deck_id: deckToImport.id
            })

        if (deckError) {
            alert(deckError.message)
            setImportingId(null)
            return
        }

        setImportedIds(prev => new Set(prev).add(deckToImport.id))
        setImportingId(null)
    }

    const handleSync = async (sourceDeck: any) => {
        const existing = importedSourceIds.get(sourceDeck.id)
        if (!existing) return

        setImportingId(sourceDeck.id)

        const localQuestions = new Set(existing.cards.map((c: any) => c.question))
        const newCards = sourceDeck.cards.filter((c: any) => !localQuestions.has(c.question))

        if (newCards.length === 0) {
            setImportingId(null)
            return
        }

        const updatedCards = [...existing.cards, ...newCards]

        const { error } = await supabase
            .from('decks')
            .update({ cards: updatedCards })
            .eq('id', existing.id)

        if (error) {
            alert(error.message)
        } else {
            setImportedSourceIds(prev => {
                const next = new Map(prev)
                const current = next.get(sourceDeck.id)
                if (current) {
                    next.set(sourceDeck.id, { ...current, cards: updatedCards })
                }
                return next
            })
        }
        setImportingId(null)
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mr-8">
                        <ChevronLeft className="h-4 w-4" /> Torna alla Dashboard
                    </Link>
                    <Logo size="sm" />
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl font-bold tracking-tight text-white">Galleria Pubblica</h1>
                        <p className="mt-4 text-lg text-zinc-400">Esplora i mazzi creati dalla community e quelli ufficiali MinDeck.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold Transition ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="mt-20 flex justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-600" />
                    </div>
                ) : (
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredDecks.map((deck) => {
                            const existingClone = importedSourceIds.get(deck.id)
                            const hasUpdate = existingClone && deck.cards.length > existingClone.cards.length
                            const isImported = importedIds.has(deck.id) || !!existingClone

                            return (
                                <div key={deck.id} className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] flex flex-col h-full">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">{deck.subject}</span>
                                            {deck.isExternal && <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Community</span>}
                                        </div>
                                        <h2 className="mt-4 text-2xl font-bold">{deck.title}</h2>
                                        <p className="mt-1 text-zinc-400">{deck.cards.length} Carte</p>
                                    </div>

                                    <div className="mt-8 flex flex-col gap-3">
                                        <button
                                            onClick={() => setPreviewDeck(deck)}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-white"
                                        >
                                            <Eye className="h-4 w-4" /> Ispeziona
                                        </button>
                                        <button
                                            onClick={() => handleImport(deck)}
                                            disabled={importingId === deck.id || (isImported && !hasUpdate)}
                                            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all active:scale-95 ${isImported && !hasUpdate
                                                ? 'bg-green-500/20 text-green-500 border border-green-500/20'
                                                : hasUpdate
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50'
                                                }`}
                                        >
                                            {importingId === deck.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isImported && !hasUpdate ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                            {importingId === deck.id
                                                ? (hasUpdate ? 'Sincronizzazione...' : 'Importando...')
                                                : isImported && !hasUpdate
                                                    ? 'Nel tuo Archivio'
                                                    : hasUpdate
                                                        ? `Sincronizza (+${deck.cards.length - existingClone!.cards.length})`
                                                        : 'Importa Mazzo'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            {previewDeck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col">
                        <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/80 p-6 backdrop-blur-md flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{previewDeck.title}</h3>
                                <p className="text-sm text-zinc-500">{previewDeck.cards.length} Carte • {previewDeck.subject}</p>
                            </div>
                            <button
                                onClick={() => setPreviewDeck(null)}
                                className="rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {previewDeck.cards.map((card, idx) => (
                                <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                    <div className="mb-2">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Domanda {idx + 1}</span>
                                        <p className="mt-1 font-medium">{card.question}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/5">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Risposta</span>
                                        <p className="mt-1 text-zinc-400">{card.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/50">
                            <button
                                onClick={() => {
                                    handleImport(previewDeck)
                                    setPreviewDeck(null)
                                }}
                                disabled={importingId === previewDeck.id || importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id)}
                                className={`flex w-full h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all active:scale-95 ${(importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id))
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/20'
                                    : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50'
                                    }`}
                            >
                                {(importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id)) ? 'Già Importato' : 'Importa questo mazzo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
