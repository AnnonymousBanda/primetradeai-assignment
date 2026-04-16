import AdminDashboard from '@/screens/AdminDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Page() {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
        </ProtectedRoute>
    )
}
