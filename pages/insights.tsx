import { GetServerSidePropsContext, NextPage } from 'next'

import { collections as collectionsAPI } from '../src/backend/api'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { Insights } from '../src/components/insights/Insights'
import { useSharedStore } from '../src/components/SharedStoreProvider'
import { CollectionData } from '../src/Types'

interface InsightsPageProps {
    collectionsData: CollectionData[]
    serverQuery: string
}

const InsightsPage: NextPage<InsightsPageProps> = ({ collectionsData, serverQuery }) => {
    const store = useSharedStore()

    store.collectionsData = collectionsData
    const query = store.searchStore.parseSearchParams(serverQuery)

    store.searchStore.search({ q: '*', ...query })

    return <Insights collectionsData={collectionsData} />
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
    const headers = getAuthorizationHeaders(req)
    const collectionsData = await collectionsAPI(headers)

    const serverQuery = req.url?.split('?')[1]?.split('#')[0] || ''

    return { props: { collectionsData, serverQuery } }
}

export default InsightsPage
