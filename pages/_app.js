import React, { createContext, useEffect } from 'react'
import App from 'next/app'
import LuxonUtils from '@date-io/luxon'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { authorizeApiSSR } from '../src/utils'
import { JSS_CSS } from "../src/constants"
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import api from '../src/api'
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

    authorizeApiSSR(appContext.ctx.req, api)
    const whoAmI = await api.whoami()
    appContext.ctx.req.whoAmI = whoAmI

    return { ...appProps, whoAmI }
}
