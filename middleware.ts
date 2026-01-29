import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Polyfill __dirname for ESM/Edge environments if needed by dependencies
if (typeof __dirname === 'undefined') {
    (globalThis as any).__dirname = '.';
}

export async function middleware(request: NextRequest) {
    try {
        console.log('Middleware invoking for path:', request.nextUrl.pathname)
        return await updateSession(request)
    } catch (err) {
        console.error('Middleware crash:', err)
        throw err
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|marketplace).*)',
    ],
}
