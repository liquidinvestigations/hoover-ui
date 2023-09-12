import { Box, Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { createOcrUrl } from '../../../../../backend/api'
import { Loading } from '../../../../common/Loading/Loading'
import PDFViewer from '../../../../pdf-viewer/Dynamic'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { useStyles } from '../../SubTabs.styles'

import { Preview } from './Preview'

export const PdfTab = observer(() => {
    const { classes } = useStyles()
    const {
        printMode,
        documentStore: {
            tabs,
            data,
            digestUrl,
            ocrData,
            collection,
            subTab,
            chunkTab,
            handleSubTabChange,
            handleChunkSubTabChange,
            pdfDocumentInfo,
            documentSearchStore: { query, setActiveSearch, pdfSearchStore },
        },
    } = useSharedStore()

    useEffect(() => {
        setActiveSearch(pdfSearchStore)
    }, [setActiveSearch, pdfSearchStore])

    if (!data || !collection || !ocrData) {
        return null
    }

    const getTabLabel = (label: string, loading: boolean, searchCount?: number) => (
        <>
            {label}
            {query && query.length > 2 && (
                <span className={classes.searchCount}>
                    {loading ? <Loading size={12} /> : <span className={`total-count${!searchCount ? ' no-results' : ''}`}>{searchCount}</span>}
                </span>
            )}
        </>
    )

    const getPreviewContainer = (index: number, key: string, tag: string) => {
        if (index !== 0 && digestUrl && data.content['content-type'] === 'application/pdf') {
            return <PDFViewer key={key} url={createOcrUrl(digestUrl, tag)} />
        } else {
            return <Preview key={key} />
        }
    }

    return (
        <>
            {!printMode && tabs.length > 1 && (
                <Box>
                    <Tabs value={subTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto">
                        {tabs.map(({ icon, name }, index) => {
                            const documentSearchCount = pdfSearchStore.getDocumentSearchResultsCount(index)
                            const loading = pdfSearchStore.getDocumentLoadingState(index) && !documentSearchCount
                            return <Tab key={index} icon={icon} label={getTabLabel(name, loading, documentSearchCount)} />
                        })}
                    </Tabs>
                </Box>
            )}
            <Box className={classes.subTab}>
                {tabs.map(({ tag }, index) => {
                    const { chunks } = pdfDocumentInfo
                    if (subTab === index && !tag?.startsWith('translated_')) {
                        if (chunks?.length > 1) {
                            return (
                                <>
                                    <Box key={tag} className={classes.chunkTabsContainer}>
                                        <Tabs value={chunkTab} onChange={handleChunkSubTabChange} variant="scrollable" scrollButtons="auto">
                                            {chunks.map((chunk: string) => {
                                                const chunkResultsCount = pdfSearchStore.getChunkSearchResultsCount(chunk)
                                                const loading = chunkResultsCount === undefined
                                                return <Tab key={chunk} label={getTabLabel(chunk, loading, chunkResultsCount)} />
                                            })}
                                        </Tabs>
                                    </Box>
                                    <Box className={classes.subTab}>
                                        {chunks.map((chunk: string, chunkIndex: number) => {
                                            if (chunkIndex === chunkTab) {
                                                return getPreviewContainer(index, chunk, tag)
                                            }
                                        })}
                                    </Box>
                                </>
                            )
                        } else {
                            getPreviewContainer(index, tag, tag)
                        }
                    }
                })}
            </Box>
        </>
    )
})
