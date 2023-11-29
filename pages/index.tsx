import { NextPage } from 'next'

import { Search } from '../src/components/search/Search'
import { useSharedStore } from '../src/components/SharedStoreProvider'

const Index: NextPage = () => {
    const store = useSharedStore()
    store.searchStore.queueSearch(window.location.search.substring(1))

    return <Search />
}

export default Index
