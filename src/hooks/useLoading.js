import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function useLoading() {
	const router = useRouter()

	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const handleRouteChangeStart = () => setLoading(true)
		const handleRouteChangeComplete = () => setLoading(false)

		router.events.on('routeChangeStart', handleRouteChangeStart)
		router.events.on('routeChangeComplete', handleRouteChangeComplete)
		router.events.on('routeChangeError', handleRouteChangeComplete)

		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart)
			router.events.off('routeChangeComplete', handleRouteChangeComplete)
			router.events.off('routeChangeError', handleRouteChangeComplete)
		}
	}, [])

	return loading
}
