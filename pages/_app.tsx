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
import { User } from '../src/Types'

interface HooverAppProps extends AppProps {
    user: User
}

export default function HooverApp({ Component, pageProps, user }: HooverAppProps) {
    return (
        <CacheProvider value={createCache({ key: 'css', prepend: true })}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <CssBaseline />
                <SharedStoreProvider user={user}>
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
