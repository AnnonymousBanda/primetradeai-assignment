import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type Role = 'USER' | 'ADMIN'

type MeResponse = {
    success?: boolean
    data?: {
        role?: Role
    }
}

const AUTH_COOKIE = 'auth_token'

function getApiBaseUrl() {
    const raw = (
        process.env.API_URL ??
        process.env.NEXT_PUBLIC_API_URL ??
        ''
    ).replace(/\/$/, '')
    return raw
}

function normalizeToken(token: string | undefined) {
    return token?.replace(/"/g, '')
}

function redirectTo(request: NextRequest, path: string) {
    return NextResponse.redirect(new URL(path, request.url))
}

async function getSessionRole(token: string | undefined): Promise<Role | null> {
    if (!token) {
        return null
    }

    const baseUrl = getApiBaseUrl()
    if (!baseUrl) {
        return null
    }

    try {
        const res = await fetch(`${baseUrl}/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            return null
        }

        const json = (await res.json()) as MeResponse
        if (!json.success) {
            return null
        }

        return json.data?.role === 'ADMIN' || json.data?.role === 'USER'
            ? json.data.role
            : null
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    const isAuthRoute = path === '/login' || path === '/register'
    const isUserRoute =
        path.startsWith('/dashboard') || path.startsWith('/watchlist')
    const isAdminRoute = path.startsWith('/admin')

    const token = normalizeToken(request.cookies.get(AUTH_COOKIE)?.value)
    const role = await getSessionRole(token)
    const isValid = role !== null

    if (!isValid && (isUserRoute || isAdminRoute)) {
        return redirectTo(request, '/login')
    }

    if (isValid && isAuthRoute) {
        return redirectTo(
            request,
            role === 'ADMIN' ? '/admin/dashboard' : '/dashboard',
        )
    }

    if (isValid && isAdminRoute && role !== 'ADMIN') {
        return redirectTo(request, '/dashboard')
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
