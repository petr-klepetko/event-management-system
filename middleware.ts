import { NextResponse, type NextRequest } from 'next/server'
import { sessionCookieName } from '@/lib/auth/constants'

const publicPaths = ['/login', '/invite', '/setup']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
    const hasSession = request.cookies.has(sessionCookieName)

    if (!hasSession && !isPublicPath) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)

        return NextResponse.redirect(loginUrl)
    }

    if (hasSession && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
