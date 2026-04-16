export const AUTH_COOKIE_NAME = 'auth_token'
export const DEFAULT_API_URL = 'http://localhost:8000/api/v1'

export type Role = 'USER' | 'ADMIN'
export type SignalAction = 'LONG' | 'SHORT'
export type SignalStatus = 'ACTIVE' | 'CLOSED'

export interface PaginationMeta {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface ApiSuccessResponse<T, M = undefined> {
    success: true
    data: T
    meta?: M
}

export interface ApiErrorResponse {
    success: false
    error: {
        code: number
        message: string
    }
}

export type ApiResponse<T, M = undefined> =
    | ApiSuccessResponse<T, M>
    | ApiErrorResponse

export interface AuthCredentials {
    email: string
    password: string
}

export interface AuthSession {
    id: string
    email: string
    role: Role
    token: string
}

export interface AuthUser {
    id: string
    email: string
    role: Role
    createdAt: string
}

export interface CurrentUser {
    id: string
    email: string
    role: Role
}

export interface Signal {
    id: string
    asset: string
    action: SignalAction
    entryPrice: number
    targetPrice: number
    stopLoss: number
    status: SignalStatus
    authorId: string
    createdAt: string
}

export interface CreateSignalInput {
    asset: string
    action: SignalAction
    entryPrice: number
    targetPrice: number
    stopLoss: number
}

export interface UpdateSignalInput {
    status: 'CLOSED'
}

export interface DeleteResourceResponse {
    id: string
}

export interface WatchlistItem {
    id: string
    userId: string
    asset: string
    createdAt: string
}

export interface CreateWatchlistInput {
    asset: string
}

export interface UpdateRoleInput {
    role: 'ADMIN'
}

export interface UpdatedRoleUser {
    id: string
    email: string
    role: 'ADMIN'
}

export interface AdminGlobalSignalsQueryOptions {
    status?: SignalStatus
    page?: number
    limit?: number
}

export interface ApiRequestOptions extends RequestInit {
    redirectOnUnauthorized?: boolean
}

export const API_URL = normalizeApiUrl(
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
)

export function normalizeApiUrl(value: string): string {
    const trimmed = value.trim().replace(/\/$/, '')
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }

    return `http://${trimmed}`
}

function isBrowser(): boolean {
    return typeof window !== 'undefined'
}

function getClientCookie(name: string): string | null {
    if (!isBrowser()) {
        return null
    }

    const pattern = new RegExp(
        `(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}=([^;]*)`,
    )
    const match = document.cookie.match(pattern)
    return match ? decodeURIComponent(match[1]) : null
}

function clearClientCookie(name: string): void {
    if (!isBrowser()) {
        return
    }

    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

async function getServerAuthToken(): Promise<string | null> {
    if (isBrowser()) {
        return null
    }

    try {
        const { cookies } = await import('next/headers')
        return cookies().get(AUTH_COOKIE_NAME)?.value ?? null
    } catch {
        return null
    }
}

function buildRequestUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    if (isBrowser()) {
        return `/api${normalizedPath}`
    }

    return `${API_URL}${normalizedPath}`
}

async function parseResponse<T, M = undefined>(
    response: Response,
): Promise<ApiResponse<T, M>> {
    const text = await response.text()

    if (!text) {
        return {
            success: true,
            data: undefined as T,
        }
    }

    try {
        return JSON.parse(text) as ApiResponse<T, M>
    } catch {
        return {
            success: false,
            error: {
                code: response.status,
                message: text,
            },
        }
    }
}

function extractErrorMessage(
    payload: ApiResponse<unknown, unknown> | null,
    fallbackStatus: number,
    responseText?: string,
): string {
    if (payload && payload.success === false) {
        return payload.error.message
    }

    if (payload && payload.success === true) {
        return `Request failed with status ${fallbackStatus}`
    }

    if (responseText) {
        try {
            const parsed = JSON.parse(responseText) as {
                message?: string
                error?: {
                    message?: string
                }
            }

            if (typeof parsed.error?.message === 'string') {
                return parsed.error.message
            }

            if (typeof parsed.message === 'string') {
                return parsed.message
            }
        } catch {
            return responseText
        }
    }

    return `Request failed with status ${fallbackStatus}`
}

async function handleUnauthorized(
    redirectOnUnauthorized: boolean,
): Promise<void> {
    if (!redirectOnUnauthorized || !isBrowser()) {
        return
    }

    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        })
    } catch {}

    clearClientCookie(AUTH_COOKIE_NAME)
    window.location.replace('/login')
}

async function buildHeaders(
    headers?: HeadersInit,
    body?: BodyInit | null,
): Promise<Headers> {
    const requestHeaders = new Headers(headers)

    requestHeaders.set('Accept', 'application/json')

    if (
        body &&
        !(body instanceof FormData) &&
        !requestHeaders.has('Content-Type')
    ) {
        requestHeaders.set('Content-Type', 'application/json')
    }

    if (isBrowser()) {
        const token = getClientCookie(AUTH_COOKIE_NAME)
        if (token) {
            requestHeaders.set('Authorization', `Bearer ${token}`)
        }
        return requestHeaders
    }

    const token = await getServerAuthToken()
    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    return requestHeaders
}

export async function apiRequest<T, M = undefined>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<ApiResponse<T, M>> {
    const {
        redirectOnUnauthorized = true,
        headers,
        body,
        method = 'GET',
        ...rest
    } = options

    const requestHeaders = await buildHeaders(headers, body)
    const response = await fetch(buildRequestUrl(path), {
        ...rest,
        method,
        headers: requestHeaders,
        body,
        credentials: isBrowser() ? 'include' : 'same-origin',
        cache: 'no-store',
    })

    const responseText = await response.clone().text()
    const payload = await parseResponse<T, M>(response)

    if (!response.ok || payload.success === false) {
        if (response.status === 401) {
            await handleUnauthorized(redirectOnUnauthorized)
        }

        const message = extractErrorMessage(
            payload as ApiResponse<unknown, unknown>,
            response.status,
            responseText,
        )
        throw new Error(message)
    }

    return payload
}

export async function apiFetch<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const response = await apiRequest<T>(path, options)
    return response.data
}

export const authApi = {
    login: (body: AuthCredentials) =>
        apiRequest<AuthSession>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(body),
            redirectOnUnauthorized: false,
        }),
    register: (body: AuthCredentials) =>
        apiRequest<AuthSession>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
            redirectOnUnauthorized: false,
        }),
    me: (options: Pick<ApiRequestOptions, 'redirectOnUnauthorized'> = {}) =>
        apiRequest<AuthUser>('/auth/me', {
            ...options,
            method: 'GET',
        }),
    logout: async () => {
        if (!isBrowser()) {
            return
        }

        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        }).catch(() => undefined)

        clearClientCookie(AUTH_COOKIE_NAME)
    },
}

export const signalsApi = {
    list: (status: SignalStatus = 'ACTIVE') =>
        apiRequest<Signal[], PaginationMeta>(`/signal?status=${status}`),
    create: (body: CreateSignalInput) =>
        apiRequest<Signal>('/signal', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    update: (id: string, body: UpdateSignalInput) =>
        apiRequest<Signal>(`/signal/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),
    remove: (id: string) =>
        apiRequest<DeleteResourceResponse>(`/signal/${id}`, {
            method: 'DELETE',
        }),
}

export function getUserWatchlistSignals() {
    return apiRequest<Signal[], PaginationMeta>('/signal/my-watchlist')
}

export function getAdminGlobalSignals(
    queryOptions: AdminGlobalSignalsQueryOptions = {},
) {
    const searchParams = new URLSearchParams()

    searchParams.set('status', queryOptions.status ?? 'ACTIVE')

    if (typeof queryOptions.page === 'number') {
        searchParams.set('page', String(queryOptions.page))
    }

    if (typeof queryOptions.limit === 'number') {
        searchParams.set('limit', String(queryOptions.limit))
    }

    return apiRequest<Signal[], PaginationMeta>(
        `/signal?${searchParams.toString()}`,
    )
}

export const watchlistApi = {
    list: () => apiRequest<WatchlistItem[]>('/watchlist'),
    create: (body: CreateWatchlistInput) =>
        apiRequest<WatchlistItem>('/watchlist', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    remove: (id: string) =>
        apiRequest<DeleteResourceResponse>(`/watchlist/${id}`, {
            method: 'DELETE',
        }),
}

export const usersApi = {
    updateRole: (id: string, body: UpdateRoleInput) =>
        apiRequest<UpdatedRoleUser>(`/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
}
