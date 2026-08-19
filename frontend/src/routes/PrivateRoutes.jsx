import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

export default function PrivateRoutes() {
	return (
		<ProtectedRoute>
			<Outlet />
		</ProtectedRoute>
	)
}
