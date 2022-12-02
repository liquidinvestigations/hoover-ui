import React from 'react'
import { useRouter } from 'next/router'
import { SearchProvider } from '../../../src/components/search/SearchProvider'
import getAuthorizationHeaders from '../../../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../../../src/backend/api'
import DirectoryUploads from '../../../src/components/uploads/DirectoryUploads'

export default function InsightsPage({ collections, serverQuery }) {

    const router = useRouter()
    const { query } = router
    const printMode = query.print && query.print !== 'false'

    return (
            <SearchProvider serverQuery={serverQuery}>
            <DirectoryUploads collection={query.collection} directoryId={query.id} />
            </SearchProvider>
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    const serverQuery = req.url.split('?')[1]?.split('#')[0] || ''

    return { props: { collections, serverQuery }}
}
