import { NextPage } from 'next'
import { useRouter } from 'next/router'

import { DirectoryUploads } from '../../../src/components/uploads/DirectoryUploads/DirectoryUploads'

const DirectoryUploadsPage: NextPage = () => {
    const { query } = useRouter()

    return <DirectoryUploads collection={query.collection} directoryId={query.id} />
}

export default DirectoryUploadsPage
