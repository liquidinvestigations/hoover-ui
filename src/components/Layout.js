import { withTheme } from '@material-ui/core/styles';
import Head from 'next/head';
import Header from './Header';
import ProgressIndicator from './ProgressIndicator';

export default withTheme()(({ children, theme }) => (
    <div>
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

            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500|Roboto+Condensed:300,400,500"
            />

            <meta name="theme-color" content={theme.palette.primary.main} />

            <script
                dangerouslySetInnerHTML={{
                    __html: `/* HOOVER HYDRATION PLACEHOLDER */\n<!-- HOOVER SCRIPT PLACEHOLDER -->`,
                }}
            />
        </Head>

        <ProgressIndicator type="linear" />
        <div>
            <Header />
            {children}
        </div>
    </div>
));
