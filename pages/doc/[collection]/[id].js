import React from 'react'
import { useRouter } from 'next/router'
import DocPage from '../../../src/components/document/DocPage'
import { useSharedStore } from "../../../src/components/SharedStoreProvider"
import getAuthorizationHeaders from '../../../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI } from '../../../src/backend/api'

export default function Doc({ collections }) {
    const router = useRouter()
    const store = useSharedStore()
    const { query } = router
    const printMode = query.print && query.print !== 'false'

    store.collections = collections
    store.printMode = printMode
    store.fullPage = true

    return <DocPage />
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    return { props: { collections }}
}
