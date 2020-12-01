import React, { useEffect } from 'react'
import LuxonUtils from '@date-io/luxon'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import { JSS_CSS } from "../src/constants"
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import '../styles/main.scss'

export default function HooverApp({ Component, pageProps }) {
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
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    )
}
