import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'auth_token'

type JwtPayload = {
    role?: 'USER' | 'ADMIN'
}

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split('.')
    if (parts.length < 2) {
        return null
    }

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
        const json = atob(padded)
        return JSON.parse(json) as JwtPayload
    } catch {
        return null
    }
}

function getRole(token: string | undefined): 'USER' | 'ADMIN' | null {
    if (!token) {
        return null
    }

    const payload = decodeJwtPayload(token)
    if (payload?.role === 'USER' || payload?.role === 'ADMIN') {
        return payload.role
    }

    return null
}

function redirectTo(request: NextRequest, destination: string) {
    const url = request.nextUrl.clone()
    url.pathname = destination
    url.search = ''
    return NextResponse.redirect(url)
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt'
    ) {
        return NextResponse.next()
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const role = getRole(token)

    if (pathname === '/login' || pathname === '/register') {
        if (token && role) {
            return redirectTo(
                request,
                role === 'ADMIN' ? '/admin/dashboard' : '/dashboard',
            )
        }

        return NextResponse.next()
    }

    if (pathname === '/dashboard' || pathname === '/watchlist') {
        if (!token) {
            return redirectTo(request, '/login')
        }

        return NextResponse.next()
    }

    if (pathname.startsWith('/admin')) {
        if (!token || role !== 'ADMIN') {
            return redirectTo(request, '/login')
        }

        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|api).*)'],
}
