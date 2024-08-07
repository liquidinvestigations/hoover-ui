import { Box, Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Fragment, ReactElement } from 'react'

import { createOcrUrl } from '../../../../../backend/api'
import { Loading } from '../../../../common/Loading/Loading'
import PDFViewer from '../../../../pdf-viewer/Dynamic'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { useStyles } from '../../SubTabs.styles'

import { Preview } from './Preview'

export const PdfTab = observer(() => {
    const { classes } = useStyles()
    const {
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
            documentSearchStore: { query, pdfSearchStore },
        },
    } = useSharedStore()

    if (!data || !collection || !ocrData) {
        return null
    }

    const getTabLabel = (label: ReactElement | string, loading: boolean, searchCount?: number) => (
        <>
            {label}
            {query && query.length > 2 && (
                <span className={classes.searchCount}>
                    {loading ? <Loading size={12} /> : <span className={`total-count${!searchCount ? ' no-results' : ''}`}>{searchCount}</span>}
                </span>
            )}
        </>
    )

    return (
        <>
            <Box className={classes.pdfTabsContainer}>
                <Tabs value={subTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto">
                    {tabs.map(({ icon, name }, index) => {
                        const documentSearchCount = pdfSearchStore.getDocumentSearchResultsCount(index)
                        const loading = pdfSearchStore.getDocumentLoadingState(index) && !documentSearchCount
                        return <Tab key={index} icon={icon} iconPosition="start" label={getTabLabel(name, loading, documentSearchCount)} />
                    })}
                </Tabs>
            </Box>
            <Box className={classes.subTab}>
                {tabs.map(({ tag }, index) => {
                    const { chunks } = pdfDocumentInfo
                    if (subTab === index && !tag?.startsWith('translated_')) {
                        if (chunks?.length > 1) {
                            return (
                                <Fragment key={index}>
                                    <Box className={classes.chunkTabsContainer}>
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
                                            if (chunkIndex !== chunkTab) {
                                                return undefined
                                            }

                                            if (index && digestUrl && data.content['content-type'] === 'application/pdf') {
                                                return <PDFViewer key={chunk} url={createOcrUrl(digestUrl, tag)} />
                                            }

                                            return <Preview key={chunk} />
                                        })}
                                    </Box>
                                </Fragment>
                            )
                        } else {
                            if (index && digestUrl && data.content['content-type'] === 'application/pdf') {
                                return <PDFViewer key={index} url={createOcrUrl(digestUrl, tag)} />
                            }

                            return <Preview key={index} />
                        }
                    }
                })}
            </Box>
        </>
    )
})
