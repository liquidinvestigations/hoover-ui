import Head from 'next/head'
import { FC, ReactNode } from 'react'

import { Header } from './common/Header/Header'
import { ProgressIndicator } from './common/ProgressIndicator/ProgressIndicator'
import { ErrorBoundary } from './ErrorBoundary'

interface LayoutProps {
    children: ReactNode | ReactNode[]
}

export const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Head>
                <title>Hoover</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content={'user-scalable=0, initial-scale=1, ' + 'minimum-scale=1, width=device-width, height=device-height'} />
            </Head>

            <ProgressIndicator type="linear" />

            <Header />

            <ErrorBoundary>{children}</ErrorBoundary>
        </>
    )
}
