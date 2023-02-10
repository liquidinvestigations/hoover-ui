import { useRouter } from 'next/router'

import DirectoryUploads from '../../../src/components/uploads/DirectoryUploads'

export default function DirectoryUploadsPage() {
    const { query } = useRouter()

    return <DirectoryUploads collection={query.collection} directoryId={query.id} />
}
