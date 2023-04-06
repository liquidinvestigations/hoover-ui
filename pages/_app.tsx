import '../styles/main.css'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import App, { AppContext, AppProps } from 'next/app'

import { whoami } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { Layout } from '../src/components/Layout'
import { SharedStoreProvider } from '../src/components/SharedStoreProvider'
import { SharedStore } from '../src/stores/SharedStore'
import { User } from '../src/Types'

interface HooverApp extends AppProps {
    user: User
}

export default function HooverApp({ Component, pageProps, user }: HooverApp) {
    return (
        <CacheProvider value={createCache({ key: 'css', prepend: true })}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <CssBaseline />
                <SharedStoreProvider store={new SharedStore(user)}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </SharedStoreProvider>
            </LocalizationProvider>
        </CacheProvider>
    )
}

HooverApp.getInitialProps = async (appContext: AppContext) => {
    const appProps = await App.getInitialProps(appContext)

    const headers = appContext.ctx.req ? getAuthorizationHeaders(appContext.ctx.req) : {}
    const user = await whoami(headers)

    return { ...appProps, user }
}
