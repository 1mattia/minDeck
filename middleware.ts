import { NextResponse, type NextRequest } from 'next/server'
// import { updateSession } from './utils/supabase/middleware'

// Fix per l'errore "ReferenceError: __dirname is not defined"
if (typeof __dirname === 'undefined') {
    (globalThis as any).__dirname = '/';
}

/**
 * Funzione Middleware
 */
export async function middleware(request: NextRequest) {
    // Commentata logica Supabase per test di isolamento
    // return await updateSession(request)
    return NextResponse.next();
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
