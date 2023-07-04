import { runInAction } from 'mobx'
import { GetServerSidePropsContext, NextPage } from 'next'

import { collections as collectionsAPI } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { Search } from '../src/components/search/Search'
import { useSharedStore } from '../src/components/SharedStoreProvider'

import type { CollectionData } from '../src/Types'

interface IndexProps {
    collectionsData: CollectionData[]
    serverQuery: string
}

const Index: NextPage<IndexProps> = ({ collectionsData, serverQuery }) => {
    const store = useSharedStore()

    runInAction(() => {
        store.collectionsData = collectionsData
    })

    const query = store.searchStore.parseSearchParams(serverQuery)

    if (query.q) {
        store.searchStore.search(query)
    }

    return <Search />
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)

    const serverQuery = req.url?.split('?')[1]?.split('#')[0] || ''

    return { props: { collectionsData, serverQuery } }
}

export default Index
