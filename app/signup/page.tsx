'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
                    <h2 className="text-3xl font-extrabold tracking-tight">Check your email</h2>
                    <p className="text-zinc-400">We've sent a confirmation link to <strong>{email}</strong>.</p>
                    <Link href="/login" className="mt-8 block text-sm font-semibold text-blue-500 hover:text-blue-400">
                        Back to login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030303] px-4 text-white">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />

            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
                <div className="text-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        Mind<span className="text-blue-500">Deck</span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold">Create an account</h2>
                    <p className="mt-2 text-sm text-zinc-400">Start your learning journey today.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="name@example.com"
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
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-white hover:text-blue-400 transition">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
