import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { documentViewUrl } from '../../utils'
import { doc as docAPI } from '../../backend/api'
import url from "url"

const DocumentContext = createContext({})

function ContentProvider({ children }) {
    const router = useRouter()
    const { query } = router

    const [data, setData] = useState()
    const [pathname, setPathname] = useState()
    const [loading, setLoading] = useState(true)

    const [digest, setDigest] = useState()
    const [digestUrl, setDigestUrl] = useState()
    const [urlIsSha, setUrlIsSha] = useState(true)

    useEffect(() => {
        if ((query.collection && query.id) || query.path) {
            let path = documentViewUrl({ _collection: query.collection, _id: query.id })
            if (query.path) {
                path = query.path
            }
            setPathname(path)
            setLoading(true)
            docAPI(path).then(data => {
                if (data.id.startsWith('_')) {
                    if (data.id.startsWith('_file_')) {
                        setDigest(data.digest)
                        setDigestUrl([url.resolve(path, './'), data.digest].join('/'))
                        setUrlIsSha(false)
                    }
                    if (data.id.startsWith('_directory_')) {
                        setDigest(null)
                        setUrlIsSha(false)
                    }
                } else {
                    setDigest(data.id)
                    setDigestUrl(path)
                    setUrlIsSha(true)
                }
                setData(data)
                setLoading(false)
            })
        }
    }, [JSON.stringify(query)])

    const printMode = query.print && query.print !== 'false'

    return (
        <DocumentContext.Provider value={{
            data,
            pathname,
            loading,
            printMode,

            digest,
            digestUrl,
            urlIsSha,
        }}>
            {children}
        </DocumentContext.Provider>
    )
}

function useData() {
    const context = useContext(DocumentContext)
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}

export { ContentProvider, useData }
