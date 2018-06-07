import Document, { Head, Main, NextScript } from 'next/document';

export default class HooverDocument extends Document {
    render() {
        return (
            <html lang="no">
                <Head>
                    <meta charSet="utf-8" />
                    <title>Hoover</title>

                    <link rel="stylesheet" href="/static/font-awesome.min.css" />
                    <link rel="stylesheet" href="/_next/static/style.css" />

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
