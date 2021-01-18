import React, { memo, useState } from 'react'
import Head from 'next/head'
import ProgressIndicator, { ProgressIndicatorContext } from './ProgressIndicator'
import Header from './Header'
import ErrorBoundary from './ErrorBoundary'

function Layout({ children }) {
    const [loading, setLoading] = useState(false)

    return (
        <>
            <Head>
                <title>Hoover</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content={
                        'user-scalable=0, initial-scale=1, ' +
                        'minimum-scale=1, width=device-width, height=device-height'
                    }
                />
            </Head>

            <ProgressIndicatorContext.Provider value={{ loading, setLoading }}>
                <ProgressIndicator type="linear" />
                <>
                    <Header />
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </>
            </ProgressIndicatorContext.Provider>
        </>
    )
}

export default memo(Layout)
