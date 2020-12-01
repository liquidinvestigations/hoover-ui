import { useEffect, useState } from 'react'
import api from '../api'

export default function useCollections() {
    const [collections, setCollections] = useState()
    const [selectedCollections, setSelectedCollections] = useState()
    const [collectionsLoading, setCollectionsLoading] = useState(true)

    useEffect(() => {
        api.collections().then(collections => {
            setCollections(collections)
            setSelectedCollections(collections?.map(c => c.name))
            setCollectionsLoading(false)
        })
    }, [])

    return [collections, collectionsLoading, selectedCollections, setSelectedCollections]
}
