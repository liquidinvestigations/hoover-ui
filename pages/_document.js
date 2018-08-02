import Document, { Head, Main, NextScript } from 'next/document';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import flush from 'styled-jsx/server';

export default class HooverDocument extends Document {
    static getInitialProps(ctx) {
        let pageContext;

        const page = ctx.renderPage(Component => {
            const WrappedComponent = props => {
                pageContext = props.pageContext;
                return <Component {...props} />;
            };

            WrappedComponent.propTypes = {
                pageContext: PropTypes.object.isRequired,
            };

            return WrappedComponent;
        });

        return {
            ...page,
            pageContext,
            // Styles fragment is rendered after the app and page rendering finish.
            styles: pageContext ? (
                <Fragment>
                    <style
                        id="jss-server-side"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                            __html: pageContext.sheetsRegistry.toString(),
                        }}
                    />
                    {flush() || null}
                </Fragment>
            ) : (
                undefined
            ),
        };
    }

    render() {
        const { pageContext } = this.props;

        return (
            <html lang="no">
                <Head>
                    <meta charSet="utf-8" />
                    <title>Hoover</title>

                    <meta
                        name="viewport"
                        content={
                            'user-scalable=0, initial-scale=1, ' +
                            'minimum-scale=1, width=device-width, height=device-height'
                        }
                    />

                    <link rel="stylesheet" href="/_next/static/style.css" />

                    <meta
                        name="theme-color"
                        content={pageContext.theme.palette.primary.main}
                    />

                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
                    />

                    <script
                        dangerouslySetInnerHTML={{
                            __html: `/* HOOVER HYDRATION PLACEHOLDER */\n<!-- HOOVER SCRIPT PLACEHOLDER -->`,
                        }}
                    />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
