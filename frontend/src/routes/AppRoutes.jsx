import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/MainLayout'
import useAuth from '../hooks/useAuth'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Donors from '../pages/Donors'
import EmergencyRequests from '../pages/EmergencyRequests'
import Hospitals from '../pages/Hospitals'
import Inventory from '../pages/Inventory'
import Notifications from '../pages/Notifications'
import Reports from '../pages/Reports'
import Donations from '../pages/Donations'
import Users from '../pages/Users'
import Login from '../pages/Login'
import PrivateRoutes from './PrivateRoutes'

const privatePages = [
	{ path: 'dashboard', label: 'Dashboard', element: <Dashboard />, allowedRoles: ['admin', 'hospital'] },
	{ path: 'donors', label: 'Donors', element: <Donors />, allowedRoles: ['admin', 'hospital'] },
	{ path: 'donations', label: 'Donations', element: <Donations />, allowedRoles: ['admin', 'hospital', 'donor'] },
	{ path: 'emergency-requests', label: 'Emergency Requests', element: <EmergencyRequests />, allowedRoles: ['admin', 'hospital'] },
	{ path: 'hospitals', label: 'Hospitals', element: <Hospitals />, allowedRoles: ['admin'] },
	{ path: 'inventory', label: 'Inventory', element: <Inventory />, allowedRoles: ['admin', 'hospital'] },
	{ path: 'notifications', label: 'Notifications', element: <Notifications />, allowedRoles: ['admin', 'hospital', 'donor'] },
	{ path: 'reports', label: 'Reports', element: <Reports />, allowedRoles: ['admin', 'hospital'] },
	{ path: 'users', label: 'Users', element: <Users />, allowedRoles: ['admin'] },
]

function RoleProtectedRoute({ children, allowedRoles = [] }) {
	const { user } = useAuth()

	if (!allowedRoles.includes(user?.role)) {
		return <Navigate to="/notifications" replace />
	}

	return children
}

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/home" replace />} />
			<Route path="/home" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route element={<PrivateRoutes />}>
				<Route element={<MainLayout />}>
					{privatePages.map((page) => (
						<Route
							key={page.path}
							path={page.path}
							element={
								<RoleProtectedRoute allowedRoles={page.allowedRoles}>
									{page.element}
								</RoleProtectedRoute>
							}
						/>
					))}
				</Route>
			</Route>
			<Route path="*" element={<Navigate to="/home" replace />} />
		</Routes>
	)
}

