import { GetServerSidePropsContext } from 'next'
import { FC } from 'react'

import { collections as collectionsAPI } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { Search } from '../src/components/search/Search'
import { SearchProvider } from '../src/components/search/SearchProvider'
import { useSharedStore } from '../src/components/SharedStoreProvider'

import type { CollectionData } from '../src/Types'

interface IndexProps {
    collectionsData: CollectionData[]
    serverQuery: string
}

const Index: FC<IndexProps> = ({ collectionsData, serverQuery }) => {
    const store = useSharedStore()

    store.collectionsData = collectionsData
    const query = store.searchStore.parseSearchParams(serverQuery)

    if (query.q) {
        store.searchStore.search(query)
    }

    return (
        <SearchProvider serverQuery={serverQuery}>
            <Search />
        </SearchProvider>
    )
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)

    const serverQuery = req.url?.split('?')[1]?.split('#')[0] || ''

    return { props: { collectionsData, serverQuery } }
}

export default Index
