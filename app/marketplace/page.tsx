'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Download, CheckCircle2, Loader2, Eye, X, Star } from 'lucide-react'

export default function MarketplacePage() {
    const [dbDecks, setDbDecks] = useState<any[]>([])
    const [importingId, setImportingId] = useState<string | null>(null)
    const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
    const [importedSourceIds, setImportedSourceIds] = useState<Set<string>>(new Set())
    const [previewDeck, setPreviewDeck] = useState<any | null>(null)
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
            const { data, error } = await supabase
                .from('decks')
                .select(`
                    *,
                    profiles(display_name),
                    stars:stars(user_id)
                `)
                .eq('is_public', true)
                .order('created_at', { ascending: false })

            if (error) console.error("Marketplace fetch error:", error)
            setDbDecks(data || [])

            // Fetch user's imported decks to prevent duplicates
            if (user) {
                const { data: userDecks } = await supabase
                    .from('decks')
                    .select('source_deck_id')
                    .eq('user_id', user.id)
                    .not('source_deck_id', 'is', null)

                if (userDecks) {
                    const ids = new Set(userDecks.map(d => d.source_deck_id as string))
                    setImportedSourceIds(ids)
                }
            }

            setLoading(false)
        }
        loadInitialData()
    }, [])

    const categories = ['All', ...Array.from(new Set(dbDecks.map(d => d.subject)))]
    const filteredDecks = activeCategory === 'All' ? dbDecks : dbDecks.filter(d => d.subject === activeCategory)

    const handleImport = async (deckToImport: any) => {
        if (!user) {
            router.push('/login')
            return
        }

        if (importedIds.has(deckToImport.id) || importedSourceIds.has(deckToImport.id)) {
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
                is_public: false,
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

    const toggleStar = async (deckId: string, hasStarred: boolean) => {
        if (!user) {
            router.push('/login')
            return
        }

        if (hasStarred) {
            await supabase.from('stars').delete().eq('user_id', user.id).eq('deck_id', deckId)
        } else {
            await supabase.from('stars').insert({ user_id: user.id, deck_id: deckId })
        }

        const { data } = await supabase
            .from('decks')
            .select(`
                *,
                profiles(display_name),
                stars:stars(user_id)
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
        setDbDecks(data || [])
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                        Mind<span className="text-blue-500">Deck</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/marketplace" className="text-sm font-medium text-white underline underline-offset-4">Marketplace</Link>
                        {user ? (
                            <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white Transition">Dashboard</Link>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white Transition">Accedi</Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">Esplora il Marketplace</h1>
                        <p className="text-xl text-zinc-400">Scarica mazzi creati dalla community o ispezionali gratuitamente.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-sm font-bold Transition ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="mt-20 flex justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredDecks.map((deck) => {
                            const starCount = deck.stars?.length || 0
                            const hasStarred = deck.stars?.some((s: any) => s.user_id === user?.id)

                            return (
                                <div key={deck.id} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="inline-flex rounded-xl bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 uppercase tracking-wider">{deck.subject}</span>
                                            <button
                                                onClick={() => toggleStar(deck.id, hasStarred)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold Transition ${hasStarred ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                                            >
                                                <Star className={`h-3.5 w-3.5 ${hasStarred ? 'fill-current' : ''}`} />
                                                {starCount}
                                            </button>
                                        </div>
                                        <h2 className="text-2xl font-black leading-tight mb-2">{deck.title}</h2>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                                                {(deck.profiles?.display_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-zinc-500 font-medium">Creato da <span className="text-zinc-300">{deck.profiles?.display_name || 'utente_mindeck'}</span></span>
                                        </div>
                                        <p className="text-zinc-500 font-medium">{deck.cards.length} Carte interattive</p>
                                    </div>

                                    <div className="mt-10 flex flex-col gap-3">
                                        <button
                                            onClick={() => setPreviewDeck(deck)}
                                            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-black transition-all hover:bg-white/10 active:scale-95 text-white"
                                        >
                                            <Eye className="h-5 w-5" /> Anteprima Carte
                                        </button>
                                        <button
                                            onClick={() => handleImport(deck)}
                                            disabled={importingId === deck.id || importedIds.has(deck.id) || importedSourceIds.has(deck.id)}
                                            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black transition-all active:scale-95 ${(importedIds.has(deck.id) || importedSourceIds.has(deck.id))
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50 shadow-xl shadow-white/5'
                                                }`}
                                        >
                                            {importingId === deck.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (importedIds.has(deck.id) || importedSourceIds.has(deck.id)) ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                                            {importingId === deck.id ? 'Importando...' : (importedIds.has(deck.id) || importedSourceIds.has(deck.id)) ? 'Nel tuo Archivio' : 'Importa Mazzo'}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
                    <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_100px_rgba(30,58,138,0.2)] flex flex-col">
                        <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/80 p-8 backdrop-blur-2xl flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">{previewDeck.title}</h3>
                                <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">{previewDeck.cards.length} Carte • {previewDeck.subject}</p>
                            </div>
                            <button
                                onClick={() => setPreviewDeck(null)}
                                className="rounded-full bg-white/5 p-3 text-zinc-400 hover:bg-white/10 hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {previewDeck.cards.map((card: any, idx: number) => (
                                <div key={idx} className="group rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 transition-all hover:bg-white/[0.03] hover:border-white/10">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Domanda {idx + 1}</span>
                                        <p className="mt-2 text-xl font-bold text-white leading-relaxed">{card.question}</p>
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Risposta Suggerita</span>
                                        <p className="mt-2 text-lg text-zinc-400 leading-relaxed">{card.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
                            <button
                                onClick={() => {
                                    handleImport(previewDeck)
                                    setPreviewDeck(null)
                                }}
                                disabled={importingId === previewDeck.id || importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id)}
                                className={`flex w-full h-16 items-center justify-center gap-2 rounded-2xl px-6 font-black transition-all active:scale-95 ${(importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id))
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/20'
                                    }`}
                            >
                                {(importedIds.has(previewDeck.id) || importedSourceIds.has(previewDeck.id)) ? 'Già Importato nel tuo Account' : 'Importa questo mazzo ora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
