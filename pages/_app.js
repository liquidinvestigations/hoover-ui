import App, { Container } from 'next/app';
import React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';
import getPageContext from '../utils/getPageContext';

import Layout from '../components/Layout';

import '../styles/main.scss';

export default class HooverApp extends App {
    pageContext = getPageContext();

    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render() {
        const { Component, pageProps } = this.props;

        return (
            <Container>
                <JssProvider
                    registry={this.pageContext.sheetsRegistry}
                    generateClassName={this.pageContext.generateClassName}>
                    <MuiThemeProvider
                        theme={this.pageContext.theme}
                        sheetsManager={this.pageContext.sheetsManager}>
                        <CssBaseline />
                        <Layout>
                            <Component
                                pageContext={this.pageContext}
                                {...pageProps}
                            />
                        </Layout>
                    </MuiThemeProvider>
                </JssProvider>
            </Container>
        );
    }
}
