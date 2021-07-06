import React from 'react'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../src/backend/api'
import Insights from '../src/components/insights/Insights'

export default function InsightsPage({ collections }) {
    return (
        <Insights
            collections={collections}
        />
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    return { props: { collections }}
}
