import { Box, Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { createOcrUrl } from '../../../../../backend/api'
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
            handleSubTabChange,
            documentSearchStore: { setActiveSearch, pdfSearchStore },
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
                        {tabs.map(({ icon, name }, index) => (
                            <Tab key={index} icon={icon} label={name} />
                        ))}
                    </Tabs>
                </Box>
            )}
            <Box className={classes.subTab}>
                {tabs.map(({ tag }, index) => {
                    if (subTab === index && !tag?.startsWith('translated_')) {
                        if (index !== 0 && digestUrl && data.content['content-type'] === 'application/pdf') {
                            return <PDFViewer key={index} url={createOcrUrl(digestUrl, tag)} />
                        } else {
                            return <Preview key={index} />
                        }
                    }
                })}
            </Box>
        </>
    )
})
