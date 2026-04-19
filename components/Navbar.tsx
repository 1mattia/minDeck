'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Logo from './Logo'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [supabase])

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Logo size="md" />
                <div className="flex items-center gap-6">
                    <Link href="/marketplace" className="text-sm font-medium text-zinc-400 hover:text-white transition">
                        Marketplace
                    </Link>
                    <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition">
                        Features
                    </a>
                    {user ? (
                        <Link href="/dashboard" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200">
                            Accedi
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
