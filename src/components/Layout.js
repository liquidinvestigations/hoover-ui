import Head from 'next/head'

import { Header } from './common/Header/Header'
import ErrorBoundary from './ErrorBoundary'
import ProgressIndicator, { ProgressIndicatorProvider } from './ProgressIndicator'

export default function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Hoover</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content={'user-scalable=0, initial-scale=1, ' + 'minimum-scale=1, width=device-width, height=device-height'} />
            </Head>

            <ProgressIndicatorProvider>
                <ProgressIndicator type="linear" />
                <Header />
                <ErrorBoundary>{children}</ErrorBoundary>
            </ProgressIndicatorProvider>
        </>
    )
}
