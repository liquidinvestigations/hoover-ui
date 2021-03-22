import React from 'react'
import { useRouter } from 'next/router'
import DocPage from '../../../src/components/document/DocPage'
import { DocumentProvider } from '../../../src/components/document/DocumentProvider'
import getAuthorizationHeaders from '../../../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../../../src/backend/api'

export default function Doc({ collections }) {
    const router = useRouter()
    const { query } = router
    const printMode = query.print && query.print !== 'false'

    return (
        <DocumentProvider
            collection={query.collection}
            collections={collections}
            id={query.id}
            path={query.path}
            printMode={printMode}
            fullPage
        >
            <DocPage />
        </DocumentProvider>
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    return { props: { collections }}
}
