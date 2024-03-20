import { NextPage } from 'next'
import { useRouter } from 'next/router'

import { DocPage } from '../../../src/components/document/DocPage/DocPage'
import { useSharedStore } from '../../../src/components/SharedStoreProvider'

const Doc: NextPage = () => {
    const router = useRouter()
    const store = useSharedStore()
    const { query } = router

    store.fullPage = true

    if (typeof query.collection === 'string' && typeof query.id === 'string') {
        store.documentStore.setDocument(query.collection, query.id)
    }

    return <DocPage />
}

export default Doc
