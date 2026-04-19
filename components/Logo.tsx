import Link from 'next/link'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
    }

    return (
        <Link href="/" className={`font-black tracking-tighter text-white hover:opacity-90 transition ${sizes[size]}`}>
            Min<span className="text-blue-500">Deck</span>
        </Link>
    )
}
