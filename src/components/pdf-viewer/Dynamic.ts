import dynamic from 'next/dynamic'

export const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })
