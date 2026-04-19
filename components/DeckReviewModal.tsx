'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Loader2, X, ThumbsUp, ThumbsDown, Save, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

type Card = {
    front: string
    back: string
    feedback?: string
}

type Props = {
    deck: {
        id: string
        title: string
        cards: Card[]
    }
    onClose: () => void
    onSaved: () => void
}

export default function DeckReviewModal({ deck, onClose, onSaved }: Props) {
    const supabase = createClient()
    const [step, setStep] = useState<'idle' | 'loading' | 'review' | 'saving' | 'saved'>('idle')
    const [reviewedCards, setReviewedCards] = useState<Card[]>([])
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
    const [error, setError] = useState('')
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    const hasChanges = reviewedCards.some(c => c.feedback && c.feedback !== 'Looks good!')

    const handleReview = async () => {
        setStep('loading')
        setError('')
        setFeedback(null)
        try {
            const res = await fetch('/api/review-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards: deck.cards })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setReviewedCards(data.reviewedCards)
            setStep('review')
        } catch (e: any) {
            setError(e.message || 'Errore durante la revisione.')
            setStep('idle')
        }
    }

    const handleSave = async () => {
        setStep('saving')
        const cleanCards = reviewedCards.map(({ front, back }) => ({ front, back }))
        const { error } = await supabase
            .from('decks')
            .update({ cards: cleanCards })
            .eq('id', deck.id)

        if (error) {
            setError(error.message)
            setStep('review')
        } else {
            setStep('saved')
            setTimeout(() => { onSaved(); onClose() }, 1500)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                    <div>
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Revisione AI
                        </h2>
                        <p className="text-sm text-zinc-500 mt-0.5">{deck.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition hover:rotate-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {step === 'saved' && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-2xl font-black">Mazzo Aggiornato!</h3>
                            <p className="text-zinc-400 mt-2">Le correzioni dell'AI sono state salvate.</p>
                        </div>
                    )}

                    {step === 'idle' && (
                        <div className="text-center py-12">
                            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-3">Vuoi che l'AI controlli il tuo mazzo?</h3>
                            <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
                                L'AI analizzerà tutte le {deck.cards.length} carte del mazzo <strong>"{deck.title}"</strong> e correggerà eventuali errori di accuratezza, grammatica o chiarezza.
                            </p>
                            {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                            <button
                                onClick={handleReview}
                                className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-purple-500 transition active:scale-95"
                            >
                                Inizia Revisione
                            </button>
                        </div>
                    )}

                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                            <p className="font-bold text-zinc-300">L'AI sta analizzando le carte...</p>
                            <p className="text-sm text-zinc-600 mt-1">Potrebbero volerci alcuni secondi</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div>
                            {/* Summary banner */}
                            <div className={`p-4 rounded-2xl mb-6 border ${hasChanges ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : 'bg-green-500/10 border-green-500/20 text-green-300'}`}>
                                {hasChanges
                                    ? `⚠️ L'AI ha trovato ${reviewedCards.filter(c => c.feedback && c.feedback !== 'Looks good!').length} carte che potrebbero essere migliorabili.`
                                    : '✅ Ottimo! L\'AI non ha trovato errori significativi nel tuo mazzo.'}
                            </div>

                            {/* Feedback buttons */}
                            <div className="flex items-center gap-3 mb-6">
                                <p className="text-sm text-zinc-400 font-bold mr-2">Ti piacciono le correzioni?</p>
                                <button
                                    onClick={() => setFeedback('positive')}
                                    className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition ${feedback === 'positive' ? 'bg-green-500 text-white' : 'border border-white/10 text-zinc-400 hover:bg-white/5'}`}
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" /> Sì
                                </button>
                                <button
                                    onClick={() => { setFeedback('negative'); handleReview() }}
                                    className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition ${feedback === 'negative' ? 'bg-red-500 text-white' : 'border border-white/10 text-zinc-400 hover:bg-white/5'}`}
                                >
                                    <ThumbsDown className="w-3.5 h-3.5" /> No, riprova
                                </button>
                            </div>

                            {/* Cards list */}
                            <div className="space-y-3">
                                {reviewedCards.map((card, i) => {
                                    const changed = card.feedback && card.feedback !== 'Looks good!'
                                    const isExpanded = expandedIndex === i
                                    return (
                                        <div key={i} className={`rounded-2xl border p-4 transition ${changed ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-zinc-600 w-5">{i + 1}</span>
                                                    <p className="font-bold text-sm text-white truncate max-w-xs">{card.front}</p>
                                                    {changed && <span className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full shrink-0">Modificata</span>}
                                                </div>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Domanda</p>
                                                        <p className="text-sm text-white">{card.front}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Risposta</p>
                                                        <p className="text-sm text-zinc-300">{card.back}</p>
                                                    </div>
                                                    {changed && (
                                                        <div className="bg-yellow-500/10 rounded-xl p-3">
                                                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">💡 Nota AI</p>
                                                            <p className="text-xs text-yellow-200">{card.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'review' && (
                    <div className="p-6 border-t border-white/5 shrink-0 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold hover:bg-white/5 transition">
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-500 transition"
                        >
                            <Save className="w-4 h-4" />
                            Salva Correzioni
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
