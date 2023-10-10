import { NextPage } from 'next'
import { useRouter } from 'next/router'

import { Search } from '../src/components/search/Search'
import { useSharedStore } from '../src/components/SharedStoreProvider'

const Index: NextPage<{ locales: any }> = () => {
    const router = useRouter()
    const store = useSharedStore()
    const { query } = router
    store.searchStore.queueSearch(query)

    return <Search />
}

export default Index
