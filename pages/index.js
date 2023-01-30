import { SearchProvider } from '../src/components/search/SearchProvider'
import { useSharedStore } from '../src/components/SharedStoreProvider'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../src/backend/api'
import { Search } from '../src/components/search/Search'

export default function Index({ collectionsData, serverQuery }) {
    const store = useSharedStore()

    store.collectionsData = collectionsData
    store.searchStore.query = store.searchStore.parseSearchParams(serverQuery)

    return (
        <SearchProvider serverQuery={serverQuery}>
            <Search collections={collectionsData} />
        </SearchProvider>
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)

    const serverQuery = req.url.split('?')[1]?.split('#')[0] || ''

    return { props: { collectionsData, serverQuery } }
}
