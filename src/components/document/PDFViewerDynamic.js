import dynamic from 'next/dynamic'

const PDFViewer = dynamic(
    () => import('./PDFViewer'),
    { ssr: false }
)

export default PDFViewer
