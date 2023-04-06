import { GetServerSidePropsContext, NextPage } from 'next'

import { collections as collectionsAPI, limits as limitsAPI } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import BatchSearch from '../src/components/search/BatchSearch'
import { useSharedStore } from '../src/components/SharedStoreProvider'
import { CollectionData, Limits } from '../src/Types'

interface BatchSearchPageProps {
    collectionsData: CollectionData[]
    limits: Limits
}

const BatchSearchPage: NextPage<BatchSearchPageProps> = ({ collectionsData, limits }) => {
    const store = useSharedStore()

    store.collectionsData = collectionsData
    store.limits = limits

    return <BatchSearch limits={limits} collectionsData={collectionsData} />
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)
    const limits = await limitsAPI(headers)

    return { props: { collectionsData, limits } }
}

export default BatchSearchPage
