import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/api'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function getBackendBaseUrl(): string | null {
    const raw = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
    if (!raw) {
        return null
    }

    const trimmed = raw.trim().replace(/\/$/, '')
    if (!trimmed) {
        return null
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }

    return `http://${trimmed}`
}

function getProxyTarget(request: NextRequest, pathSegments: string[]): string {
    const baseUrl = getBackendBaseUrl()
    if (!baseUrl) {
        throw new Error('Missing API_URL/NEXT_PUBLIC_API_URL for API proxy')
    }

    const path = `/${pathSegments.join('/')}`
    return `${baseUrl}${path}${request.nextUrl.search}`
}

function toCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    }
}

function toExpiredCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    }
}

async function proxy(request: NextRequest, pathSegments: string[]) {
    const path = `/${pathSegments.join('/')}`

    if (path === '/auth/logout') {
        const response = NextResponse.json({
            success: true,
            data: { ok: true },
        })
        response.cookies.set(AUTH_COOKIE_NAME, '', toExpiredCookieOptions())
        return response
    }

    const headers = new Headers()
    request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase()
        if (
            lowerKey === 'host' ||
            lowerKey === 'connection' ||
            lowerKey === 'content-length' ||
            lowerKey === 'cookie'
        ) {
            return
        }
        headers.set(key, value)
    })

    headers.set('Accept', 'application/json')

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const hasBody = !['GET', 'HEAD'].includes(request.method)
    const body = hasBody ? await request.text() : undefined

    let backendResponse: Response
    try {
        backendResponse = await fetch(getProxyTarget(request, pathSegments), {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
        })
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to reach upstream backend'

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 502,
                    message,
                },
            },
            { status: 502 },
        )
    }

    const responseText = await backendResponse.text()
    const response = new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
            'Content-Type':
                backendResponse.headers.get('content-type') ??
                'application/json',
        },
    })

    if (backendResponse.status === 401) {
        response.cookies.set(AUTH_COOKIE_NAME, '', toExpiredCookieOptions())
    }

    if (
        backendResponse.ok &&
        (path === '/auth/login' || path === '/auth/register')
    ) {
        try {
            const payload = JSON.parse(responseText) as {
                success?: boolean
                data?: { token?: string }
            }
            const tokenValue = payload?.data?.token
            if (payload?.success && tokenValue) {
                response.cookies.set(
                    AUTH_COOKIE_NAME,
                    tokenValue,
                    toCookieOptions(),
                )
            }
        } catch {
            void 0
        }
    }

    return response
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params
    return proxy(request, path)
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params
    return proxy(request, path)
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params
    return proxy(request, path)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params
    return proxy(request, path)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params
    return proxy(request, path)
}
