import App from 'next/app';
import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import { StylesProvider, ThemeProvider } from '@material-ui/core/styles';

import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import getPageContext from '../src/get-page-context';
import withReduxStore from '../src/with-redux-store';
import { Provider } from 'react-redux';

import Layout from '../src/components/Layout';
import routerEvents from '../src/router-events';
import { routeChanged } from '../src/actions';
import { JSS_CSS } from "../src/constants";

import '../styles/main.scss';

class HooverApp extends App {
    pageContext = getPageContext();

    handleRouteChange = url => this.props.reduxStore.dispatch(routeChanged(url));

    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector(`#${JSS_CSS}`);
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }

        routerEvents.on('changeComplete', this.handleRouteChange);
        this.handleRouteChange(window.location.href);
    }

    componentWillUnmount() {
        routerEvents.removeListener('changeComplete', this.handleRouteChange);
    }

    render() {
        const { Component, pageProps, reduxStore } = this.props;

        return (
            <StylesProvider
                generateClassName={this.pageContext.generateClassName}>
                <ThemeProvider
                    theme={this.pageContext.theme}>
                    <CssBaseline />
                    <Provider store={reduxStore}>
                        <MuiPickersUtilsProvider utils={LuxonUtils}>
                            <Layout>
                                <Component
                                    pageContext={this.pageContext}
                                    {...pageProps}
                                />
                            </Layout>
                        </MuiPickersUtilsProvider>
                    </Provider>
                </ThemeProvider>
            </StylesProvider>
        );
    }
}

export default withReduxStore(HooverApp);
