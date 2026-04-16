import Watchlist from '@/screens/Watchlist'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Page() {
    return (
        <ProtectedRoute requiredRole="USER">
            <Watchlist />
        </ProtectedRoute>
    )
}
