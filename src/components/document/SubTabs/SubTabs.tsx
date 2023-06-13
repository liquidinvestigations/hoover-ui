import { Box, Tab, Tabs, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, ReactElement } from 'react'

import { createOcrUrl } from '../../../backend/api'
import { reactIcons } from '../../../constants/icons'
import { Expandable } from '../../common/Expandable/Expandable'
import PDFViewer from '../../pdf-viewer/Dynamic'
import { useSharedStore } from '../../SharedStoreProvider'
import { TabPanel } from '../TabPanel/TabPanel'

import { Email } from './components/Email/Email'
import { Files } from './components/Files/Files'
import { Preview, PREVIEWABLE_MIME_TYPE_SUFFEXES } from './components/Preview/Preview'
import { Text } from './components/Text/Text'
import { useStyles } from './SubTabs.styles'

interface Tab {
    tag: string
    name: string
    icon: ReactElement
    content: ReactElement
}

export const SubTabs = observer(() => {
    const { classes } = useStyles()
    const {
        printMode,
        documentStore: { data, digestUrl, docRawUrl, ocrData, collection, subTab, handleSubTabChange },
    } = useSharedStore()

    if (!data || !collection || !ocrData) {
        return null
    }

    const hasPreview =
        data.content['has-pdf-preview'] ||
        (docRawUrl && data.content['content-type'] && PREVIEWABLE_MIME_TYPE_SUFFEXES.some((x) => data.content['content-type'].endsWith(x)))

    const tabs = [
        {
            name: 'Extracted from file',
            icon: reactIcons.content,
            content: <Text content={data.content.text} />,
        } as Tab,
    ]

    tabs.push(
        ...ocrData.map(
            ({ tag, text }) =>
                ({
                    tag,
                    name: (tag.startsWith('translated_') ? '' : 'OCR ') + tag,
                    icon: reactIcons.ocr,
                    content: <Text content={text} />,
                } as Tab)
        )
    )

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
                {data.content.filetype === 'email' && <Email />}

                {tabs.map(({ tag }, index) => {
                    if (subTab === index && hasPreview && !tag?.startsWith('translated_')) {
                        if (index !== 0 && digestUrl && data.content['content-type'] === 'application/pdf') {
                            return <PDFViewer key={index} url={createOcrUrl(digestUrl, tag)} />
                        } else {
                            return <Preview key={index} />
                        }
                    }
                })}

                {!!data.children?.length && (
                    <Box>
                        <Expandable
                            resizable
                            defaultOpen
                            highlight={false}
                            fullHeight={false}
                            title={
                                <>
                                    {cloneElement(reactIcons.contentFiles, { className: classes.icon })}
                                    Files
                                </>
                            }>
                            <Files />
                        </Expandable>
                    </Box>
                )}

                {tabs.map(({ name, content }, index) => (
                    <Box key={index}>
                        {printMode && tabs.length > 1 && (
                            <Typography variant="h5" className={classes.printTitle}>
                                {name}
                            </Typography>
                        )}
                        <TabPanel value={subTab} index={index} alwaysVisible={printMode}>
                            {content}
                        </TabPanel>
                    </Box>
                ))}
            </Box>
        </>
    )
})