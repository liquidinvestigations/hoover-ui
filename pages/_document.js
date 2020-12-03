import React, { createContext } from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/core/styles'
import { resetServerContext } from 'react-beautiful-dnd'
import { removeCommentsAndSpacing } from "../src/utils"
import { JSS_CSS } from "../src/constants"
import api from '../src/api'

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
            whoAmI: ctx.req.whoAmI,
            // Styles fragment is rendered after the app and page rendering finish.
            styles: [
                ...React.Children.toArray(initialProps.styles),
                <style
                    id={JSS_CSS}
                    key={JSS_CSS}
                    dangerouslySetInnerHTML={{
                        __html: removeCommentsAndSpacing(sheets.toString())
                    }}
                />
            ],
        }
    }

    render() {
        const { whoAmI } = this.props
        return (
            <Html>
                <Head>
                    {whoAmI.urls.hypothesis_embed && (
                        <>
                            <script async src={whoAmI.urls.hypothesis_embed} />
                            <script dangerouslySetInnerHTML={{
                                __html: 'window.hypothesisConfig = function() {'+
                                    'return {'+
                                        'showHighlights: true,'+
                                        "appType: 'bookmarklet'"+
                                    '}'+
                                '}'
                            }}>
                            </script>
                        </>
                    )}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default HooverDocument
