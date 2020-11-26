import React, { useEffect } from 'react'
import LuxonUtils from '@date-io/luxon'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import withReduxStore from '../src/with-redux-store'
import { JSS_CSS } from "../src/constants"
import Layout from '../src/components/Layout'
import theme from '../src/theme'
import '../styles/main.scss'

import { useRouter } from 'next/router'
import { routeChanged } from '../src/actions'

function HooverApp({ Component, pageProps, reduxStore }) {
    const router = useRouter()
    const handleRouteChange = url => reduxStore.dispatch(routeChanged(url))

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`);
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }

        router.events.on('routeChangeComplete', handleRouteChange)
        handleRouteChange(window.location.href)

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [])

    return (
        <ThemeProvider
            theme={theme}>
            <CssBaseline />
            <Provider store={reduxStore}>
                <MuiPickersUtilsProvider utils={LuxonUtils}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </MuiPickersUtilsProvider>
            </Provider>
        </ThemeProvider>
    )
}

export default withReduxStore(HooverApp)
