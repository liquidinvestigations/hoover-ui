import '../styles/main.css'
import React, { useEffect } from 'react'
import App from 'next/app'
import LuxonUtils from '@date-io/luxon'
import { ThemeProvider } from '@material-ui/core/styles'
import { CssBaseline } from '@material-ui/core'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { JSS_CSS } from "../src/constants/general"
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import { whoami } from '../src/backend/api'
import UserProvider from '../src/components/UserProvider'
import HashStateProvider from '../src/components/HashStateProvider'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'

export default function HooverApp({ Component, pageProps, whoAmI }) {
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`);
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
                <CssBaseline />
                <UserProvider whoAmI={whoAmI}>
                    <HashStateProvider>
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </HashStateProvider>
                </UserProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    )
}

HooverApp.getInitialProps = async appContext => {
    const appProps = await App.getInitialProps(appContext)

    const headers = appContext.ctx.req ? getAuthorizationHeaders(appContext.ctx.req) : {}
    const whoAmI = await whoami(headers)

    return { ...appProps, whoAmI }
}
