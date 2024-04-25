import { FC, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Outlet, useLocation } from 'react-router-dom'

import { Header } from './common/Header/Header'
import { ProgressIndicator } from './common/ProgressIndicator/ProgressIndicator'
import { ErrorBoundary } from './ErrorBoundary'
import { useSharedStore } from './SharedStoreProvider'

export const Layout: FC = () => {
    const {
        hashStore: { parseHashState },
    } = useSharedStore()
    const location = useLocation()

    useEffect(() => {
        parseHashState(location.hash)
    }, [location.hash])

    return (
        <>
            <Helmet>
                <title>Hoover</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content={'user-scalable=0, initial-scale=1, ' + 'minimum-scale=1, width=device-width, height=device-height'} />
            </Helmet>

            <ProgressIndicator type="linear" />

            <Header />

            <ErrorBoundary>
                <Outlet />
            </ErrorBoundary>
        </>
    )
}
