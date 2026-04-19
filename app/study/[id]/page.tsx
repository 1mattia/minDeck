'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, RotateCcw, BrainCircuit, Play, X } from 'lucide-react'
import Logo from '@/components/Logo'

export default function WebStudyPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [deck, setDeck] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [hasFlipped, setHasFlipped] = useState(false)
    const [studyMode, setStudyMode] = useState(false)
    const [showAppBanner, setShowAppBanner] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('appBannerDismissed') !== 'true'
        }
        return true
    })

    useEffect(() => {
        async function fetchDeck() {
            const { data, error } = await supabase
                .from('decks')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setDeck(data)
            }
            setLoading(false)
        }
        fetchDeck()
    }, [id, supabase])

    if (loading) return <div className="h-screen bg-[#030303] text-white flex justify-center items-center">Caricamento...</div>
    if (!deck) return <div className="h-screen bg-[#030303] text-white flex justify-center items-center">Mazzo non trovato.</div>

    const currentCard = deck.cards[currentIndex]

    const nextCard = () => {
        setIsFlipped(false)
        setHasFlipped(false)
        if (currentIndex < deck.cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevCard = () => {
        setIsFlipped(false)
        setHasFlipped(false)
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    return (
        <div className="h-screen bg-[#030303] text-white flex flex-col">
            <nav className="p-6 flex items-center justify-between border-b border-white/5">
                <Logo size="sm" />
                <div className="font-bold">{deck.title}</div>
                <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{currentIndex + 1} / {deck.cards.length}</div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 relative">
                
                {/* Download App Ad */}
                {showAppBanner && (
                    <div className="absolute top-8 right-8 bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl max-w-sm hidden md:block">
                        <button
                            onClick={() => {
                                setShowAppBanner(false)
                                localStorage.setItem('appBannerDismissed', 'true')
                            }}
                            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h4 className="font-bold text-blue-400 mb-1 pr-5">Studia Offline con l'App 📱</h4>
                        <p className="text-sm text-zinc-400 mb-3">Scarica MinDeck per iOS e Android, porta le tue Flashcards sempre con te con notifiche di ripasso intelligenti (Spaced Repetition).</p>
                        <Link href="#" className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">Scarica l'App</Link>
                    </div>
                )}

                {!studyMode ? (
                    <div className="text-center max-w-lg">
                        <BrainCircuit className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                        <h1 className="text-4xl font-extrabold mb-4">Pronto a studiare?</h1>
                        <p className="text-zinc-400 mb-8 leading-relaxed">Fai pratica con le {deck.cards?.length} carte di questo mazzo. Clicca sulla carta per girarla e verificare la risposta.</p>
                        <button 
                            onClick={() => setStudyMode(true)}
                            className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-2 hover:bg-zinc-200 transition mx-auto text-lg"
                        >
                            <Play className="w-6 h-6 fill-black" /> Inizia Sessione
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl">
                        
                        <div 
                            onClick={() => { setIsFlipped(!isFlipped); setHasFlipped(true) }}
                            className="relative w-full aspect-video perspective-1000 cursor-pointer"
                        >
                            <div className={`w-full h-full absolute top-0 left-0 transition-all duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                                
                                {/* Front */}
                                <div className="absolute w-full h-full backface-hidden bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-center items-center text-center">
                                    <span className="absolute top-6 left-6 text-xs font-bold tracking-widest text-blue-500 uppercase">Domanda</span>
                                    <h2 className="text-3xl font-extrabold leading-tight">{currentCard?.question || currentCard?.front}</h2>
                                    <p className="absolute bottom-6 text-zinc-500 text-sm">Clicca per girare</p>
                                </div>

                                {/* Back */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-600 text-white rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                                    <span className="absolute top-6 left-6 text-xs font-bold tracking-widest text-white/50 uppercase">Risposta</span>
                                    <h2 className="text-2xl font-bold leading-relaxed">{currentCard?.answer || currentCard?.back}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-6 mt-12">
                            <button 
                                onClick={prevCard} 
                                disabled={currentIndex === 0}
                                className="p-4 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 transition"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => {
                                    setIsFlipped(false)
                                    setCurrentIndex(0)
                                    setStudyMode(false)
                                }}
                                className="text-zinc-500 hover:text-white font-bold flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Ricomincia
                            </button>
                            <button 
                                onClick={nextCard} 
                                disabled={!hasFlipped || currentIndex === deck.cards?.length - 1}
                                title={!hasFlipped ? 'Gira la carta per vedere la risposta prima di andare avanti' : ''}
                                className="p-4 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
