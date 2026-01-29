import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Fix per l'errore "ReferenceError: __dirname is not defined"
// Questo shim inganna le librerie CJS che girano nell'ambiente Edge di Vercel
if (typeof __dirname === 'undefined') {
    (globalThis as any).__dirname = '/';
}

/**
 * Funzione Middleware (ripristinata per compatibilità Vercel)
 */
export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (e) {
        console.error("Middleware error:", e)
        // In caso di errore, proseguiamo senza bloccare (fail-safe)
        return
    }
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
