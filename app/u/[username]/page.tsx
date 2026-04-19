'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, UserMinus, ShieldCheck } from 'lucide-react'

export default function PublicProfilePage() {
    const { username } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [decks, setDecks] = useState<any[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            // Look up profile by username
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single()

            if (profileError || !profileData) {
                setLoading(false)
                return
            }

            setProfile(profileData)

            // Load public decks for this profile
            const { data: deckData } = await supabase
                .from('decks')
                .select('*, stars(user_id)')
                .eq('user_id', profileData.id)
                .eq('is_public', true)
            
            setDecks(deckData || [])

            // Load followers
            const { count } = await supabase
                .from('followers')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', profileData.id)
            
            setFollowersCount(count || 0)

            // Check if current user is following
            if (user && user.id !== profileData.id) {
                const { data: followData } = await supabase
                    .from('followers')
                    .select('*')
                    .eq('follower_id', user.id)
                    .eq('following_id', profileData.id)
                    .single()
                
                if (followData) setIsFollowing(true)
            }

            setLoading(false)
        }

        loadProfile()
    }, [username, supabase])

    const handleFollowToggle = async () => {
        if (!user) {
            router.push('/login')
            return
        }
        if (!profile || user.id === profile.id) return

        if (isFollowing) {
            await supabase.from('followers').delete()
                .eq('follower_id', user.id)
                .eq('following_id', profile.id)
            setFollowersCount(prev => prev - 1)
        } else {
            await supabase.from('followers').insert({
                follower_id: user.id,
                following_id: profile.id
            })
            setFollowersCount(prev => prev + 1)
        }
        setIsFollowing(!isFollowing)
    }

    if (loading) return <div className="min-h-screen bg-[#030303] text-white flex justify-center items-center">Loading...</div>
    if (!profile) return <div className="min-h-screen bg-[#030303] text-white flex justify-center items-center">Utente non trovato.</div>

    return (
        <div className="min-h-screen bg-[#030303] text-white py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl">
                        {profile.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <h1 className="text-4xl font-extrabold">{profile.display_name}</h1>
                            {followersCount > 100 && <ShieldCheck className="h-6 w-6 text-blue-500" />}
                        </div>
                        <p className="text-xl text-zinc-400 mb-4">@{profile.username}</p>
                        <p className="text-zinc-300 mb-6 max-w-lg">{profile.bio || "Nessuna biografia."}</p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{followersCount}</p>
                                <p className="text-sm tracking-widest uppercase text-zinc-500 font-bold mb-4">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{decks.length}</p>
                                <p className="text-sm tracking-widest uppercase text-zinc-500 font-bold mb-4">Mazzi Pubblici</p>
                            </div>
                        </div>

                        {user?.id !== profile.id && (
                            <button
                                onClick={handleFollowToggle}
                                className={`mt-4 px-6 py-2.5 rounded-full font-bold flex items-center justify-center gap-2 transition active:scale-95 mx-auto md:mx-0 ${isFollowing ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                            >
                                {isFollowing ? <><UserMinus className="h-4 w-4" /> Non seguire più</> : <><UserPlus className="h-4 w-4" /> Segui</>}
                            </button>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-black mb-6">I Mazzi di {profile.display_name}</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    {decks.length === 0 ? (
                        <p className="text-zinc-500">Questo utente non ha mazzi pubblici.</p>
                    ) : (
                        decks.map(deck => (
                           <div key={deck.id} className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04]">
                               <h3 className="text-xl font-bold">{deck.title}</h3>
                               <span className="text-sm text-zinc-400">{deck.subject}</span>
                               <p className="text-sm mt-4 text-zinc-500">{deck.cards?.length || 0} Carte</p>
                               <Link href={`/marketplace`} className="text-blue-500 hover:text-blue-400 mt-4 inline-block text-sm font-bold">
                                   Vedi nel Marketplace →
                               </Link>
                           </div> 
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
