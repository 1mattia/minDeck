'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    
    const [profile, setProfile] = useState({
        display_name: '',
        username: '',
        bio: '',
        email: ''
    })

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({
                    display_name: data.display_name || '',
                    username: data.username || '',
                    bio: data.bio || '',
                    email: user.email || ''
                })
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase, router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ text: '', type: '' })

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Update Email if changed
            if (profile.email !== user.email) {
                const { error: authError } = await supabase.auth.updateUser({ email: profile.email })
                if (authError) throw authError
            }

            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: profile.display_name,
                    username: profile.username,
                    bio: profile.bio
                })
                .eq('id', user.id)

            if (profileError) {
                // If it's a unique constraint error for username
                if (profileError.code === '23505') {
                    throw new Error('Username is already taken.')
                }
                throw profileError
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' })
        } catch (error: any) {
            setMessage({ text: error.message || 'An error occurred', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <p>Loading settings...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030303]">
            <Navbar />
            
            <div className="max-w-2xl mx-auto pt-32 pb-12 px-4 relative">
                <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

            <h1 className="text-3xl font-extrabold text-white mb-2">Account Settings</h1>
            <p className="text-zinc-400 mb-8">Manage your profile and preferences. Changes reflect on the App instantly.</p>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-zinc-400">Display Name</label>
                        <input
                            type="text"
                            value={profile.display_name}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition focus:border-blue-500 focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-zinc-400">Username</label>
                        <input
                            type="text"
                            required
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition focus:border-blue-500 focus:outline-none"
                            placeholder="johndoe123"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-400">Email Address</label>
                    <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition focus:border-blue-500 focus:outline-none"
                        placeholder="john@example.com"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Changing this might require email verification.</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-zinc-400">Bio</label>
                    <textarea
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Tell us a bit about your studies..."
                    />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </form>
            </div>
        </div>
    )
}
