import React, { createContext, useEffect } from 'react'
import App from 'next/app'
import LuxonUtils from '@date-io/luxon'
import { ThemeProvider } from '@material-ui/core/styles'
import { CssBaseline } from '@material-ui/core'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { JSS_CSS } from "../src/constants"
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import { whoami } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import '../styles/main.scss'

export const UserContext = createContext(null)

export default function HooverApp({ Component, pageProps, whoAmI }) {
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`);
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, [])

    return (
        <UserContext.Provider value={whoAmI}>
            <ThemeProvider theme={theme}>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                    <CssBaseline />
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        </UserContext.Provider>
    )
}

HooverApp.getInitialProps = async appContext => {
    const appProps = await App.getInitialProps(appContext)

    const headers = getAuthorizationHeaders(appContext.ctx.req)
    const whoAmI = await whoami(headers)
    appContext.ctx.req.whoAmI = whoAmI

    return { ...appProps, whoAmI }
}
