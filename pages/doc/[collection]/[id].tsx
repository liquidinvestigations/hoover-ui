import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { FC } from 'react'

import { collections as collectionsAPI } from '../../../src/backend/api'
import getAuthorizationHeaders from '../../../src/backend/getAuthorizationHeaders'
import { DocPage } from '../../../src/components/document/DocPage'
import { useSharedStore } from '../../../src/components/SharedStoreProvider'
import { CollectionData } from '../../../src/Types'

interface DocProps {
    collectionsData: CollectionData[]
}

const Doc: FC<DocProps> = ({ collectionsData }) => {
    const router = useRouter()
    const store = useSharedStore()
    const { query } = router
    const printMode = query.print && query.print !== 'false'

    store.collectionsData = collectionsData
    store.printMode = Boolean(printMode)
    store.fullPage = true

    if (typeof query.collection === 'string' && typeof query.id === 'string') {
        store.documentStore.setDocument(query.collection, query.id)
    }

    return <DocPage />
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)

    return { props: { collectionsData } }
}

export default Doc
