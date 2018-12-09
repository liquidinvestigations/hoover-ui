import App, { Container } from 'next/app';
import React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';

import LuxonUtils from '@date-io/luxon';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import getPageContext from '../src/get-page-context';
import withReduxStore from '../src/with-redux-store';
import { Provider } from 'react-redux';

import Layout from '../src/components/Layout';
import routerEvents from '../src/router-events';
import { routeChanged } from '../src/actions';

import '../styles/main.scss';

class HooverApp extends App {
    pageContext = getPageContext();

    handleRouteChange = url => this.props.reduxStore.dispatch(routeChanged(url));

    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
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
            <Container>
                <JssProvider
                    registry={this.pageContext.sheetsRegistry}
                    generateClassName={this.pageContext.generateClassName}>
                    <MuiThemeProvider
                        theme={this.pageContext.theme}
                        sheetsManager={this.pageContext.sheetsManager}>
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
                    </MuiThemeProvider>
                </JssProvider>
            </Container>
        );
    }
}

export default withReduxStore(HooverApp);
