import React, { useEffect } from 'react'
import LuxonUtils from '@date-io/luxon';
import { Provider } from 'react-redux';
import { StylesProvider, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import getPageContext from '../src/get-page-context';
import withReduxStore from '../src/with-redux-store';
import { JSS_CSS } from "../src/constants";
import Layout from '../src/components/Layout';

import '../styles/main.scss';

function HooverApp({ Component, pageProps, reduxStore }) {
    const pageContext = getPageContext()

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`);
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, [])

    return (
        <StylesProvider
            generateClassName={pageContext.generateClassName}>
            <ThemeProvider
                theme={pageContext.theme}>
                <CssBaseline />
                <Provider store={reduxStore}>
                    <MuiPickersUtilsProvider utils={LuxonUtils}>
                        <Layout>
                            <Component
                                pageContext={pageContext}
                                {...pageProps}
                            />
                        </Layout>
                    </MuiPickersUtilsProvider>
                </Provider>
            </ThemeProvider>
        </StylesProvider>
    )
}

export default withReduxStore(HooverApp)
