'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Download, BookOpen, ChevronRight, Globe, Lock, Edit2 } from 'lucide-react'
import DeckModal from '@/components/DeckModal'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [decks, setDecks] = useState<any[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedDeckForEdit, setSelectedDeckForEdit] = useState<any>(null)
    const [displayName, setDisplayName] = useState('')
    const [isEditingProfile, setIsEditingProfile] = useState(false)
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

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single()

        if (profile) setDisplayName(profile.display_name)

        const { data: decks } = await supabase
            .from('decks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setDecks(decks || [])
        setLoading(false)
    }

    const handleProfileUpdate = async () => {
        if (!user) return
        const { error } = await supabase
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', user.id)

        if (error) alert(error.message)
        else setIsEditingProfile(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) return null

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {showCreateModal && <DeckModal onClose={() => {
                setShowCreateModal(false)
                loadData()
            }} />}

            {selectedDeckForEdit && <DeckModal
                initialData={selectedDeckForEdit}
                onClose={() => {
                    setSelectedDeckForEdit(null)
                    loadData()
                }}
            />}
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                        Mind<span className="text-blue-500">Deck</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        {isEditingProfile ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                    placeholder="Nome Visualizzato"
                                />
                                <button onClick={handleProfileUpdate} className="text-xs font-black text-blue-500 hover:text-blue-400">Salva</button>
                                <button onClick={() => setIsEditingProfile(false)} className="text-xs font-black text-zinc-500 hover:text-zinc-400">Annulla</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-white">{displayName || user.email.split('@')[0]}</span>
                                    <button onClick={() => setIsEditingProfile(true)} className="text-[10px] font-bold text-blue-500 hover:underline">Modifica Profilo</button>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                                    {(displayName || user.email).charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                        <form action="/auth/signout" method="post">
                            <button className="text-sm font-black text-zinc-500 Transition hover:text-red-500">
                                Esci
                            </button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">I miei Mazzi</h1>
                    <div className="flex gap-4">
                        <Link href="/dashboard/import" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
                            <Download className="h-4 w-4" /> Importa Mazzi
                        </Link>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4" /> Nuovo Mazzo
                        </button>
                    </div>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {decks && decks.length > 0 ? (
                        decks.map((deck) => (
                            <div key={deck.id} className="group rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${deck.is_public ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'}`}>
                                        {deck.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                        {deck.is_public ? 'Pubblico' : 'Privato'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold">{deck.title}</h3>
                                <p className="mt-1 text-sm text-zinc-400">{deck.subject}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{deck.cards?.length || 0} carte</span>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedDeckForEdit(deck)}
                                            className="text-sm font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" /> Modifica
                                        </button>
                                        <button className="text-sm font-semibold text-blue-500 hover:text-blue-400">Studia</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-16 text-center">
                                <BookOpen className="h-12 w-12 text-zinc-600" />
                                <h2 className="mt-4 text-xl font-bold">Non hai ancora mazzi personali</h2>
                                <p className="mt-2 text-zinc-500 max-w-sm text-sm">Crea il tuo primo mazzo o sfoglia il Marketplace per iniziare subito a studiare.</p>
                                <Link href="/marketplace" className="mt-6 text-sm font-bold text-blue-500 hover:underline">Vai al Marketplace →</Link>
                            </div>

                            <div className="mt-12">
                                <h2 className="text-xl font-bold mb-6">Mazzi Consigliati</h2>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <LibraryPreviewCard title="Matematica Completa" subject="Matematica" />
                                    <LibraryPreviewCard title="Storia d'Italia" subject="Storia" />
                                    <LibraryPreviewCard title="Programmazione Base" subject="Informatica" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function LibraryPreviewCard({ title, subject }: { title: string, subject: string }) {
    return (
        <Link href="/dashboard/import" className="group flex flex-col rounded-3xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] hover:border-blue-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                <Download className="h-5 w-5" />
            </div>
            <h4 className="font-bold">{title}</h4>
            <p className="text-xs text-zinc-500 mt-1">{subject}</p>
            <div className="mt-6 flex items-center text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Scarica Ora <ChevronRight className="ml-1 h-3 w-3" />
            </div>
        </Link>
    )
}
