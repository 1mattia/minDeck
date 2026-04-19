'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Download, BookOpen, Globe, Lock, Edit2, Sparkles, Settings, Play, Star } from 'lucide-react'
import DeckModal from '@/components/DeckModal'
import DeckReviewModal from '@/components/DeckReviewModal'
import Logo from '@/components/Logo'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [decks, setDecks] = useState<any[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedDeckForEdit, setSelectedDeckForEdit] = useState<any>(null)
    const [reviewingDeck, setReviewingDeck] = useState<any>(null)
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        setUser(user)

        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', user.id)
            .single()

        if (profile) {
            setDisplayName(profile.display_name || '')
            setUsername(profile.username || '')
        }

        const { data: decks } = await supabase
            .from('decks')
            .select('*, stars(user_id)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setDecks(decks || [])
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {showCreateModal && <DeckModal onClose={() => { setShowCreateModal(false); loadData() }} />}
            {selectedDeckForEdit && <DeckModal initialData={selectedDeckForEdit} onClose={() => { setSelectedDeckForEdit(null); loadData() }} />}
            {reviewingDeck && <DeckReviewModal deck={reviewingDeck} onClose={() => setReviewingDeck(null)} onSaved={loadData} />}

            {/* Top Nav */}
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Logo size="md" />
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/marketplace" className="text-sm font-bold text-zinc-400 hover:text-white transition">Marketplace</Link>
                        <Link href="/dashboard/ai-generate" className="flex items-center gap-1.5 text-sm font-bold text-purple-400 hover:text-purple-300 transition">
                            <Sparkles className="w-4 h-4" /> AI Generate
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/settings" className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition" title="Impostazioni">
                            <Settings className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-white">{displayName || user?.email?.split('@')[0]}</p>
                                {username && <p className="text-xs text-zinc-500">@{username}</p>}
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">
                                {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button className="text-xs font-bold text-zinc-600 hover:text-red-500 transition">Esci</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-12">

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition text-left group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black">Nuovo Mazzo</p>
                            <p className="text-xs text-zinc-400">Crea manualmente</p>
                        </div>
                    </button>
                    <Link
                        href="/dashboard/ai-generate"
                        className="flex items-center gap-4 p-5 rounded-2xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 transition text-left group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-110 transition">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black">Genera con AI</p>
                            <p className="text-xs text-zinc-400">Powered by Gemini</p>
                        </div>
                    </Link>
                    <Link
                        href="/marketplace"
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition text-left group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black">Marketplace</p>
                            <p className="text-xs text-zinc-400">Importa dalla community</p>
                        </div>
                    </Link>
                </div>

                {/* Deck List */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black">I miei Mazzi <span className="text-zinc-600 text-base font-bold ml-2">{decks.length}</span></h1>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {decks.length > 0 ? decks.map((deck) => (
                        <div key={deck.id} className="group rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/10 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${deck.is_public ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'}`}>
                                    {deck.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                    {deck.is_public ? 'Pubblico' : 'Privato'}
                                </div>
                                {deck.stars && deck.stars.length > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-black">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {deck.stars.length}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-black flex-1">{deck.title}</h3>
                            <p className="text-sm text-zinc-500 mt-1">{deck.subject}</p>
                            <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-xs text-zinc-600 font-bold">{deck.cards?.length || 0} carte</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDeckForEdit(deck)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" /> Modifica
                                    </button>
                                    <button
                                        onClick={() => setReviewingDeck(deck)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-500/10 transition"
                                        title="Revisiona con AI"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" /> AI
                                    </button>
                                    <Link
                                        href={`/study/${deck.id}`}
                                        className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg transition"
                                    >
                                        <Play className="h-3.5 w-3.5 fill-white" /> Studia
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-24 text-center">
                            <BookOpen className="h-12 w-12 text-zinc-700 mb-4" />
                            <h2 className="text-xl font-bold mb-2">Nessun mazzo ancora</h2>
                            <p className="text-zinc-500 text-sm max-w-xs mb-8">Crea il tuo primo mazzo oppure lascia che l'AI lo generi per te in secondi.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setShowCreateModal(true)} className="bg-white text-black px-6 py-3 rounded-xl font-black text-sm hover:bg-zinc-200 transition">
                                    Crea Mazzo
                                </button>
                                <Link href="/dashboard/ai-generate" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-purple-500 transition flex items-center gap-2 justify-center">
                                    <Sparkles className="w-4 h-4" /> Genera con AI
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
