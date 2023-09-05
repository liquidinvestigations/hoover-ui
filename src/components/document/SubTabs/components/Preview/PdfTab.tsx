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

    return (
        <>
            {!printMode && tabs.length > 1 && (
                <Box>
                    <Tabs value={subTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto">
                        {tabs.map(({ icon, name }, index) => {
                            const documentSearchCount = pdfSearchStore.getDocumentSearchResultsCount(index)
                            return (
                            <Tab
                                key={index}
                                icon={icon}
                                label={
                                    <>
                                        {name}
                                        {query && query.length > 2 && (
                                            <span className={classes.searchCount}>
                                                {pdfSearchStore.getDocumentLoadingState(index) && !Boolean(documentSearchCount)  ? (
                                                    <Loading size={12} />
                                                ) : (
                                                    <span className="totalCount">{documentSearchCount}</span>
                                                )}
                                            </span>
                                        )}
                                    </>
                                }
                            />
                        )})}
                    </Tabs>
                </Box>
            )}
            <Box className={classes.subTab}>
                {tabs.map(({ tag }, index) => {
                    if (!pdfDocumentInfo[index]) return
                    const { chunks } = pdfDocumentInfo[index]
                    if (subTab === index && !tag?.startsWith('translated_')) {
                        if (chunks?.length > 1) {
                            return (
                                <>
                                    <Box key={tag}>
                                        <Tabs value={chunkTab} onChange={handleChunkSubTabChange} variant="scrollable" scrollButtons="auto">
                                            {chunks.map((chunk: string) => {
                                                const chunkResultsCount = pdfSearchStore.getChunkSearchResultsCount(chunk)
                                                return (
                                                <Tab
                                                    key={chunk}
                                                    label={
                                                        <>
                                                            {chunk}
                                                            {query && query.length > 2 && (
                                                                <span className={classes.searchCount}>
                                                                    {chunkResultsCount === undefined ? (
                                                                        <Loading size={12} />
                                                                    ) : (
                                                                        <span className="totalCount">{chunkResultsCount}</span>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            )})}
                                        </Tabs>
                                    </Box>
                                    <Box className={classes.subTab}>
                                        {chunks.map((chunk: string, chunkIndex: number) => {
                                            if (chunkIndex === chunkTab) {
                                                if (index !== 0 && digestUrl && data.content['content-type'] === 'application/pdf') {
                                                    return <PDFViewer key={chunk} url={createOcrUrl(digestUrl, tag)} />
                                                } else {
                                                    return <Preview key={chunk} />
                                                }
                                            }
                                        })}
                                    </Box>
                                </>
                            )
                        } else {
                            if (index !== 0 && digestUrl && data.content['content-type'] === 'application/pdf') {
                                return <PDFViewer key={tag} url={createOcrUrl(digestUrl, tag)} />
                            } else {
                                return <Preview key={tag} />
                            }
                        }
                    }
                })}
            </Box>
        </>
    )
})
