import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from './common/Header/Header'
import { ProgressIndicator } from './common/ProgressIndicator/ProgressIndicator'
import { ErrorBoundary } from './ErrorBoundary'

export const Layout: FC = () => {
    return (
        <>
            <head>
                <title>Hoover</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content={'user-scalable=0, initial-scale=1, ' + 'minimum-scale=1, width=device-width, height=device-height'} />
            </head>

            <ProgressIndicator type="linear" />

            <Header />

            <ErrorBoundary>
                <Outlet />
            </ErrorBoundary>
        </>
    )
}
