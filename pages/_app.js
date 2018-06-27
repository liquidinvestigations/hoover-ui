import App, { Container } from 'next/app';
import React from 'react';
import Layout from '../components/Layout';

import '../styles/main.scss';

export default class HooverApp extends App {
    render() {
        const { Component, pageProps } = this.props;

        return (
            <Container>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Container>
        );
    }
}
