'use client'

import { useState } from 'react'
import { Plus, X, Trash2, Globe, Lock, Upload } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export default function DeckModal({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [subject, setSubject] = useState(initialData?.subject || '')
    const [isPublic, setIsPublic] = useState(initialData?.is_public || false)
    const [cards, setCards] = useState<{ question: string, answer: string }[]>(() => {
        if (!initialData?.cards) return [{ question: '', answer: '' }]
        // Normalizza: supporta sia {question/answer} che {front/back}
        return initialData.cards.map((c: any) => ({
            question: c.question ?? c.front ?? '',
            answer: c.answer ?? c.back ?? ''
        }))
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addCard = () => setCards([...cards, { question: '', answer: '' }])
    const removeCard = (index: number) => setCards(cards.filter((_, i) => i !== index))
    const updateCard = (index: number, field: 'question' | 'answer', value: string) => {
        setCards(prev => prev.map((card, i) =>
            i === index ? { ...card, [field]: value } : card
        ))
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                if (json.title) setTitle(json.title)
                if (json.subject) setSubject(json.subject)
                if (json.cards && Array.isArray(json.cards)) {
                    setCards(json.cards)
                }
            } catch (err) {
                alert('Errore: Il file JSON non è valido o è corrotto.')
            }
        }
        reader.readAsText(file)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const deckData = {
            user_id: user.id,
            title,
            subject,
            cards,
            is_public: isPublic
        }

        let error;
        if (initialData?.id) {
            const { error: updateError } = await supabase
                .from('decks')
                .update(deckData)
                .eq('id', initialData.id)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from('decks')
                .insert(deckData)
            error = insertError
        }

        if (error) {
            alert(error.message)
            setLoading(false)
        } else {
            router.refresh()
            onClose()
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id) return
        if (!confirm('Sei sicuro di voler eliminare questo mazzo? Questa azione è irreversibile.')) return

        setLoading(true)
        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', initialData.id)

        if (error) {
            alert(error.message)
            setLoading(false)
        } else {
            router.refresh()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{initialData ? 'Modifica Mazzo' : 'Crea Nuovo Mazzo'}</h2>
                        {!initialData && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-1 flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                <Upload className="h-3 w-3" /> Carica file JSON
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                    <button onClick={onClose} className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Titolo del Mazzo</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="es. Storia Romana"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Materia / Categoria</label>
                            <input
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="es. Storia"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPublic ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                                {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{isPublic ? 'Mazzo Pubblico' : 'Mazzo Privato'}</p>
                                <p className="text-xs text-zinc-500">{isPublic ? 'Tutti potranno vederlo nel catalogo' : 'Solo tu potrai vederlo'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative h-6 w-11 rounded-full Transition ${isPublic ? 'bg-blue-600' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Carte ({cards.length})</h3>
                            <button
                                type="button"
                                onClick={addCard}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400"
                            >
                                <Plus className="h-4 w-4" /> Aggiungi Carta
                            </button>
                        </div>

                        {cards.map((card, idx) => (
                            <div key={idx} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-4">
                                <button
                                    type="button"
                                    onClick={() => removeCard(idx)}
                                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Domanda</label>
                                    <input
                                        required
                                        value={card.question}
                                        onChange={(e) => updateCard(idx, 'question', e.target.value)}
                                        className="mt-1 block w-full border-none bg-transparent p-0 text-white placeholder-zinc-700 focus:ring-0"
                                        placeholder="Scrivi la domanda..."
                                    />
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Risposta</label>
                                    <input
                                        required
                                        value={card.answer}
                                        onChange={(e) => updateCard(idx, 'answer', e.target.value)}
                                        className="mt-1 block w-full border-none bg-transparent p-0 text-zinc-400 placeholder-zinc-700 focus:ring-0"
                                        placeholder="Scrivi la risposta..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </form>

                <div className="p-6 border-t border-white/5 flex gap-4">
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl border border-red-500/50 bg-red-500/10 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" /> Elimina
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`${initialData ? 'flex-[2]' : 'w-full'} h-12 rounded-xl bg-white font-bold text-black hover:bg-zinc-200 active:scale-95 disabled:opacity-50`}
                    >
                        {loading ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Crea Mazzo'}
                    </button>
                </div>
            </div>
        </div>
    )
}
