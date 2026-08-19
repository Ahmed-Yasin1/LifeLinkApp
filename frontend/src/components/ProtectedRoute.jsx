import { useEffect } from 'react'
import Loading from './Loading'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
	const { isAuthenticated, isLoading } = useAuth()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			window.location.replace(redirectTo)
		}
	}, [isAuthenticated, isLoading, redirectTo])

	if (isLoading) {
		return <Loading message="Checking your session..." />
	}

	return children
}
