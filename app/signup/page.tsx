'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    username: username
                }
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#030303] px-4 text-white text-center">
                <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
                    <h2 className="text-3xl font-extrabold tracking-tight">Controlla la tua email</h2>
                    <p className="text-zinc-400">Abbiamo inviato un link di conferma a <strong>{email}</strong>.</p>
                    <Link href="/login" className="mt-8 block text-sm font-semibold text-blue-500 hover:text-blue-400">
                        Torna al login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030303] px-4 text-white">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
                <div className="text-center">
                    <Logo size="md" />
                    <h2 className="mt-6 text-3xl font-extrabold">Crea un account</h2>
                    <p className="mt-2 text-sm text-zinc-400">Inizia il tuo percorso di studio oggi.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="nome_utente"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Indirizzo Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="nome@esempio.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-bold text-black transition hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Creazione account...' : 'Registrati'}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500">
                    Hai già un account?{' '}
                    <Link href="/login" className="font-semibold text-white hover:text-blue-400 transition">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    )
}
