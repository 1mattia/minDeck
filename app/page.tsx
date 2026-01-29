'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, BookOpen, Share2, Shield, ChevronRight, Star, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

export default function LandingPage() {
  const [topDecks, setTopDecks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTopDecks() {
      const { data, error } = await supabase
        .from('decks')
        .select(`
                    *,
                    profiles(display_name),
                    stars:stars(user_id)
                `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) console.error("Home fetch error:", error)
      setTopDecks(data || [])
      setLoading(false)
    }
    fetchTopDecks()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#030303] text-white selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-48 pb-32 text-center">
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-sm font-medium backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Nuova funzione: Importazione JSON disponibile ora
        </div>

        <h1 className="max-w-5xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-8xl">
          Impara più veloce <br /> con <span className="text-blue-500">MindDeck</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-zinc-400 sm:text-xl font-medium">
          L'unico strumento che unisce design premium e scienza cognitiva. Gestisci i tuoi mazzi, importa file JSON e sfida la community.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
          <Link
            href="/signup"
            className="flex h-16 items-center justify-center rounded-2xl bg-white px-12 text-lg font-black text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
          >
            Inizia Ora Gratis
          </Link>
          <Link
            href="/marketplace"
            className="flex h-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-12 text-lg font-black text-white transition-all hover:bg-white/10 active:scale-95"
          >
            Marketplace →
          </Link>
        </div>
      </section>

      {/* Featured Decks (Public Preview) */}
      <section className="mx-auto max-w-7xl px-6 py-32 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Mazzi Star della Community</h2>
            <p className="mt-4 text-zinc-400 text-lg font-medium font-medium">Scopri i mazzi più apprezzati creati dai nostri utenti. Studia subito o aggiungili alla tua collezione.</p>
          </div>
          <Link href="/marketplace" className="text-blue-500 font-bold hover:underline flex items-center gap-2 text-lg">
            Vedi tutti i mazzi <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {topDecks.length > 0 ? topDecks.map((deck) => (
              <DynamicDeckCard key={deck.id} deck={deck} />
            )) : (
              <div className="col-span-full py-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
                <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500">Nessun mazzo pubblico disponibile al momento</h3>
                <p className="text-zinc-600 mt-2">Sii il primo a caricarne uno!</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Funzionalità Premium</h2>
          <p className="mt-4 text-zinc-500 text-lg">Tutto ciò di cui hai bisogno per eccellere nei tuoi studi.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="Import JSON"
            description="Carica file JSON e crea mazzi istantaneamente senza dover digitare a mano."
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-blue-500" />}
            title="Metodo Efficace"
            description="Sfrutta la ripetizione spaziata per memorizzare concetti complessi in metà tempo."
          />
          <FeatureCard
            icon={<Share2 className="h-6 w-6 text-indigo-500" />}
            title="Community"
            description="Condividi i tuoi mazzi migliori e scala le classifiche ricevendo stelle dagli utenti."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-emerald-500" />}
            title="Cloud Sync"
            description="I tuoi dati sono sempre al sicuro e sincronizzati su tutti i tuoi dispositivi."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Logo" width={64} height={64} className="opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        </div>
        <p className="text-zinc-600 font-medium">© 2026 MindDeck. Creato per il futuro dell'apprendimento.</p>
      </footer>
    </div>
  )
}

function DynamicDeckCard({ deck }: { deck: any }) {
  return (
    <Link href={`/marketplace`} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex rounded-xl bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 uppercase tracking-wider">{deck.subject}</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-black border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
            <Star className="h-3 w-3 fill-current" />
            {deck.stars?.length || 0}
          </div>
        </div>
        <h3 className="text-2xl font-black leading-tight mb-2 group-hover:text-blue-500 transition-colors">{deck.title}</h3>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase">
            {(deck.profiles?.display_name || 'U').charAt(0)}
          </div>
          <span className="text-xs text-zinc-500 font-bold italic">@{deck.profiles?.display_name || 'utente_mindeck'}</span>
        </div>
        <p className="text-sm text-zinc-400 font-medium">{deck.cards.length} Carte interattive</p>
      </div>
      <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5 text-sm font-black text-blue-500 group-hover:translate-x-1 transition-transform">
        Ispeziona Mazzo <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05] hover:border-white/10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 transition-all group-hover:scale-110 group-hover:bg-white/10">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-black">{title}</h3>
      <p className="text-zinc-500 font-medium leading-relaxed">{description}</p>
    </div>
  )
}
