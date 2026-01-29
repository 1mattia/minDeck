import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

/**
 * Next.js 16 Proxy Function
 * Sostituisce il vecchio middleware.ts
 */
export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Intercetta tutte le rotte tranne:
         * - file statici (_next/static, _next/image)
         * - icone e immagini (favicon.ico, svg, png, etc.)
         * - la rotta marketplace (esclusa esplicitamente)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|marketplace).*)',
    ],
}
