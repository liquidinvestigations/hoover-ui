import createEmotionServer from '@emotion/server/create-instance'
import { ServerStyleSheets } from '@mui/styles'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { Children } from 'react'
import { resetServerContext } from 'react-beautiful-dnd'

import { JSS_CSS } from '../src/constants/general'
import createEmotionCache from '../src/createEmotionCache'
import { removeCommentsAndSpacing } from '../src/utils/utils'

class HooverDocument extends Document {
    static async getInitialProps(ctx) {
        // Render app and page and get the context of the page with collected side effects.
        const cache = createEmotionCache()
        const { extractCriticalToChunks } = createEmotionServer(cache)
        const sheets = new ServerStyleSheets()
        const originalRenderPage = ctx.renderPage

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
            })

        const initialProps = await Document.getInitialProps(ctx)

        // Generate style tags for the styles coming from Emotion
        // This is important. It prevents Emotion from rendering invalid HTML.
        // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
        const emotionStyles = extractCriticalToChunks(initialProps.html)
        const emotionStyleTags = emotionStyles.styles.map((style) => (
            <style
                data-emotion={`${style.key} ${style.ids.join(' ')}`}
                key={style.key}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: style.css }}
            />
        ))

        resetServerContext()

        return {
            ...initialProps,
            // Styles fragment is rendered after the app and page rendering finish.
            styles: [
                ...emotionStyleTags,
                ...Children.toArray(initialProps.styles),
                <style
                    id={JSS_CSS}
                    key={JSS_CSS}
                    dangerouslySetInnerHTML={{
                        __html: removeCommentsAndSpacing(sheets.toString()),
                    }}
                />,
            ],
        }
    }

    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default HooverDocument
