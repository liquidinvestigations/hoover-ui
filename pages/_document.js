import { Children } from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@mui/styles'
import { resetServerContext } from 'react-beautiful-dnd'
import { removeCommentsAndSpacing } from '../src/utils'
import { JSS_CSS } from '../src/constants/general'

class HooverDocument extends Document {
    static async getInitialProps(ctx) {
        // Render app and page and get the context of the page with collected side effects.
        const sheets = new ServerStyleSheets()
        const originalRenderPage = ctx.renderPage

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
            })

        const initialProps = await Document.getInitialProps(ctx)
        resetServerContext()

        return {
            ...initialProps,
            // Styles fragment is rendered after the app and page rendering finish.
            styles: [
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
