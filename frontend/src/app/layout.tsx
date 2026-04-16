import type { Metadata } from 'next'
import { AppProviders } from './providers'
import '../index.css'

export const metadata: Metadata = {
    title: 'CryptoIntel',
    description: 'Real-time crypto intelligence and signal tracking',
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    )
}
