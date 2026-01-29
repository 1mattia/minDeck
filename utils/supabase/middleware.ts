import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // meglio usare service key

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.next()
    }

    let response = NextResponse.next()

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options)
                })
            },
        },
    })

    try {
        // refreshing the auth token (opzionale)
        await supabase.auth.getUser()
    } catch (error) {
        console.error('Supabase auth error in proxy:', error)
    }

    return response
}
