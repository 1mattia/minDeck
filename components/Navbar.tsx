import Image from 'next/image'

export default function Navbar() {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <a href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tighter text-white">
                    <Image src="/logo.png" alt="MindDeck Logo" width={48} height={48} className="rounded-xl shadow-2xl shadow-blue-500/20" />
                    Mind<span className="text-blue-500">Deck</span>
                </a>
                <div className="flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-zinc-400 Transition hover:text-white">Features</a>
                    <a href="/login" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200">
                        Sign In
                    </a>
                </div>
            </div>
        </nav>
    )
}
