import '../styles/main.css'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import App from 'next/app'
import { useEffect } from 'react'

import { whoami } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import Layout from '../src/components/Layout'
import { SharedStoreProvider } from '../src/components/SharedStoreProvider'
import { JSS_CSS } from '../src/constants/general'
import { SharedStore } from '../src/stores/SharedStore'
import theme from '../src/theme'

export default function HooverApp({ Component, pageProps, user }) {
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`)
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles)
        }
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <CssBaseline />
                <SharedStoreProvider store={new SharedStore(user)}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </SharedStoreProvider>
            </LocalizationProvider>
        </ThemeProvider>
    )
}

HooverApp.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext)

    const headers = appContext.ctx.req ? getAuthorizationHeaders(appContext.ctx.req) : {}
    const user = await whoami(headers)

    return { ...appProps, user }
}
