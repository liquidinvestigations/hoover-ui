import React from 'react'
import { SearchProvider } from '../src/components/search/SearchProvider'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../src/backend/api'
import Search from '../src/components/search/Search'

export default function Index({ collections, serverQuery }) {
    return (
        <SearchProvider serverQuery={serverQuery}>
            <Search collections={collections} />
        </SearchProvider>
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    const serverQuery = req.url.split('?')[1] || ''

    return { props: { collections, serverQuery }}
}
