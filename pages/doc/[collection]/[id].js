import React from 'react'
import { useRouter } from 'next/router'
import DocPage from '../../../src/components/document/DocPage'
import { DocumentProvider } from '../../../src/components/document/DocumentProvider'

export default function Doc() {
    const router = useRouter()
    const { query } = router
    const printMode = query.print && query.print !== 'false'

    return (
        <DocumentProvider
            collection={query.collection}
            id={query.id}
            path={query.path}
            printMode={printMode}
            fullPage
        >
            <DocPage />
        </DocumentProvider>
    )
}
