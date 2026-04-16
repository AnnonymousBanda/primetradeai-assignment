const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface ApiResponse<T> {
    success: boolean
    data?: T
    meta?: Record<string, unknown>
    error?: { message: string }
}

function getToken(): string | null {
    return localStorage.getItem('token')
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const json: ApiResponse<T> = await res.json()

    if (!json.success) {
        throw new Error(json.error?.message || 'An unexpected error occurred')
    }

    return json.data as T
}
