'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ChevronLeft, Loader2, Save, RefreshCw, ThumbsUp, ThumbsDown, CheckCircle2, Globe, Lock } from 'lucide-react'
import Logo from '@/components/Logo'

type Card = {
    front: string
    back: string
    feedback?: string
}

export default function AIGeneratePage() {
    const supabase = createClient()
    const router = useRouter()

    const [topic, setTopic] = useState('')
    const [difficulty, setDifficulty] = useState('intermediate')
    const [count, setCount] = useState(10)
    const [cards, setCards] = useState<Card[]>([])
    const [deckTitle, setDeckTitle] = useState('')
    const [subject, setSubject] = useState('')
    const [loading, setLoading] = useState(false)
    const [reviewing, setReviewing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [step, setStep] = useState<'input' | 'review' | 'done'>('input')
    const [isPublic, setIsPublic] = useState(false)
    const [error, setError] = useState('')
    const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)

    const handleGenerate = async () => {
        if (!topic.trim()) return
        setLoading(true)
        setError('')
        setStep('input')
        setCards([])
        setFeedbackGiven(null)

        try {
            const res = await fetch('/api/generate-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, count })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCards(data.cards)
            setDeckTitle(`Mazzo su: ${topic}`)
            setStep('review')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAIReview = async () => {
        setReviewing(true)
        setFeedbackGiven(null)
        try {
            const res = await fetch('/api/review-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCards(data.reviewedCards)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setReviewing(false)
        }
    }

    const handleSave = async () => {
        if (!deckTitle.trim()) return
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        // strip the 'feedback' field before saving
        const cleanCards = cards.map(({ front, back }) => ({ front, back }))

        const { error } = await supabase.from('decks').insert({
            user_id: user.id,
            title: deckTitle,
            subject: subject || topic,
            cards: cleanCards,
            is_public: isPublic
        })

        if (error) setError(error.message)
        else { setSaved(true); setStep('done') }
        setSaving(false)
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-bold">
                        <ChevronLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <Logo size="sm" />
                    <div className="w-24" />
                </div>
            </nav>

            <main className="mx-auto max-w-3xl px-6 py-16">

                {step === 'done' ? (
                    <div className="text-center py-20">
                        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h1 className="text-4xl font-extrabold mb-4">Mazzo Salvato!</h1>
                        <p className="text-zinc-400 mb-10">Il tuo mazzo &quot;{deckTitle}&quot; è stato salvato con successo.</p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/dashboard" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition">
                                Vai alla Dashboard
                            </Link>
                            <button onClick={() => { setStep('input'); setCards([]); setTopic('') }} className="border border-white/10 px-8 py-3 rounded-xl font-bold text-zinc-300 hover:bg-white/5 transition">
                                Genera un altro
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Input Form */}
                        <div className="mb-10">
                            <h1 className="text-4xl font-extrabold mb-2">Crea un Mazzo con l'AI ✨</h1>
                            <p className="text-zinc-400">Descrivi l'argomento e l'AI genererà un mazzo completo di flashcard in pochi secondi.</p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-6 mb-10">
                            <div>
                                <label className="text-sm font-bold text-zinc-400 mb-2 block">Argomento *</label>
                                <textarea
                                    rows={3}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none transition"
                                    placeholder="Es: 'Le capitali europee', 'Grammatica italiana B2', 'Principi della Termodinamica'..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-zinc-400 mb-2 block">Difficoltà</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                                    >
                                        <option value="basic">Base (studente)</option>
                                        <option value="intermediate">Intermedio</option>
                                        <option value="advanced">Avanzato (esame)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-zinc-400 mb-2 block">Numero di Carte</label>
                                    <select
                                        value={count}
                                        onChange={(e) => setCount(Number(e.target.value))}
                                        className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                                    >
                                        <option value={5}>5 carte</option>
                                        <option value={10}>10 carte</option>
                                        <option value={15}>15 carte</option>
                                        <option value={20}>20 carte</option>
                                    </select>
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPublic ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                                        {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{isPublic ? 'Rendi Pubblico' : 'Rimani Privato'}</p>
                                        <p className="text-[10px] sm:text-xs text-zinc-500">{isPublic ? 'Tutti potranno vederlo nel Marketplace' : 'Solo tu potrai vederlo'}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${isPublic ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isPublic ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {error && <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !topic.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-500 transition active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generando il mazzo...</> : <><Sparkles className="w-5 h-5" /> Genera Mazzo</>}
                            </button>
                        </div>

                        {/* Preview & AI Review */}
                        {cards.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-black">{cards.length} Carte Generate</h2>
                                    <button
                                        onClick={handleAIReview}
                                        disabled={reviewing}
                                        className="flex items-center gap-2 text-sm font-bold border border-purple-500/30 text-purple-400 px-4 py-2 rounded-full hover:bg-purple-500/10 transition disabled:opacity-50"
                                    >
                                        {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                        Revisiona con AI
                                    </button>
                                </div>

                                {/* AI Review Feedback */}
                                {cards.some(c => c.feedback) && (
                                    <div className="mb-6 bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl">
                                        <p className="text-purple-300 font-bold text-sm mb-3">✨ L'AI ha revisionato le tue carte. Ti piace il risultato?</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setFeedbackGiven('positive')}
                                                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition ${feedbackGiven === 'positive' ? 'bg-green-500 text-white' : 'border border-white/10 text-zinc-300 hover:bg-white/5'}`}
                                            >
                                                <ThumbsUp className="w-4 h-4" /> Sì, va bene!
                                            </button>
                                            <button
                                                onClick={() => { setFeedbackGiven('negative'); handleGenerate() }}
                                                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition ${feedbackGiven === 'negative' ? 'bg-red-500 text-white' : 'border border-white/10 text-zinc-300 hover:bg-white/5'}`}
                                            >
                                                <ThumbsDown className="w-4 h-4" /> No, rigenera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Card Preview */}
                                <div className="space-y-4 mb-8">
                                    {cards.map((card, i) => (
                                        <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Domanda</p>
                                                    <p className="font-bold text-white">{card.front}</p>
                                                    <div className="mt-4 pt-4 border-t border-white/5">
                                                        <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-2">Risposta</p>
                                                        <p className="text-zinc-300">{card.back}</p>
                                                    </div>
                                                    {card.feedback && card.feedback !== 'Looks good!' && (
                                                        <div className="mt-3 pt-3 border-t border-purple-500/20">
                                                            <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">💡 Feedback AI</p>
                                                            <p className="text-xs text-purple-300">{card.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-black text-zinc-700 shrink-0">{i + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Save Form */}
                                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
                                    <h3 className="text-lg font-black">Salva il Mazzo</h3>
                                    <input
                                        type="text"
                                        value={deckTitle}
                                        onChange={(e) => setDeckTitle(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
                                        placeholder="Titolo del mazzo"
                                    />
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition"
                                        placeholder="Materia (es: Matematica, Storia...)"
                                    />

                                    {/* Visibility Toggle */}
                                    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPublic ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                                                {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{isPublic ? 'Rendi Pubblico' : 'Rimani Privato'}</p>
                                                <p className="text-xs text-zinc-500">{isPublic ? 'Tutti potranno vederlo nel Marketplace' : 'Solo tu potrai vederlo'}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsPublic(!isPublic)}
                                            className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${isPublic ? 'bg-blue-600' : 'bg-zinc-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isPublic ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !deckTitle.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-black hover:bg-green-500 transition disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? 'Salvataggio...' : 'Salva nella Dashboard'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
