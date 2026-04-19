'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LoginPage() {
    const [loginInput, setLoginInput] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        let actualEmail = loginInput;

        // If it's a username (doesn't contain @), resolve it to an email
        if (!loginInput.includes('@')) {
            const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
                p_username: loginInput
            });
            
            if (rpcError || !data) {
                setError('Invalid username or password.');
                setLoading(false);
                return;
            }
            actualEmail = data as string;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: actualEmail,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030303] px-4 text-white">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
                <div className="text-center">
                    <Logo size="md" />
                    <h2 className="mt-6 text-3xl font-extrabold">Bentornato</h2>
                    <p className="mt-2 text-sm text-zinc-400">Inserisci i tuoi dati per accedere.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Email or Username</label>
                            <input
                                type="text"
                                required
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="name@example.com or username"
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
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-white hover:text-blue-400 transition">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    )
}
