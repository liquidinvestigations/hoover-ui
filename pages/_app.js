import '../styles/main.css'
import { useEffect } from 'react'
import App from 'next/app'
import { ThemeProvider } from '@mui/styles'
import { CssBaseline } from '@mui/material'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { JSS_CSS } from '../src/constants/general'
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import { whoami } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { SharedStore } from '../src/stores/SharedStore'
import { SharedStoreProvider } from '../src/components/SharedStoreProvider'

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
