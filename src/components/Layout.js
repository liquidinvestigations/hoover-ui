import React, { memo, useState } from 'react'
import Head from 'next/head'
import Header from './Header'
import theme from '../theme'
import ProgressIndicator, { ProgressIndicatorContext } from './ProgressIndicator'
import ErrorBoundary from './ErrorBoundary'

function Layout({ children }) {
    const [loading, setLoading] = useState(false)

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <title>Hoover</title>

                <meta
                    name="viewport"
                    content={
                        'user-scalable=0, initial-scale=1, ' +
                        'minimum-scale=1, width=device-width, height=device-height'
                    }
                />

                <meta name="theme-color" content={theme.palette.primary.main} />
            </Head>

            <ProgressIndicatorContext.Provider value={{ loading, setLoading }}>
                <ProgressIndicator type="linear" />
                <div>
                    <Header />
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </ProgressIndicatorContext.Provider>
        </>
    )
}

export default memo(Layout)