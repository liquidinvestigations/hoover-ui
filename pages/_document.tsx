import Document, { DocumentContext } from 'next/document'
import { resetServerContext } from 'react-beautiful-dnd'

export default class HooverDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        resetServerContext()

        return { ...initialProps }
    }
}
