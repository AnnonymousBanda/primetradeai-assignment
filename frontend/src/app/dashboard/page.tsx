import Dashboard from '@/screens/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Page() {
    return (
        <ProtectedRoute requiredRole="USER">
            <Dashboard />
        </ProtectedRoute>
    )
}
