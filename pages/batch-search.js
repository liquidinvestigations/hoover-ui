import React from 'react'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI, limits as limitsAPI } from '../src/backend/api'
import BatchSearch from '../src/components/search/BatchSearch'
import { useSharedStore } from "../src/components/SharedStoreProvider"

export default function BatchSearchPage({ collections, limits }) {
    const store = useSharedStore()

    store.collections = collections
    store.limits = limits

    return (
        <BatchSearch
            limits={limits}
            collections={collections}
        />
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)
    const limits = await limitsAPI(headers)

    return { props: { collections, limits }}
}
