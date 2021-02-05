import React, { memo } from 'react'
import Text from './Text'
import { Box, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { FolderOutlined, Subject, TextFields } from '@material-ui/icons'
import Expandable from '../Expandable'
import Preview, { PREVIEWABLE_MIME_TYPE_SUFFEXES } from './Preview'
import { useDocument } from './DocumentProvider'
import TabPanel from './TabPanel'
import Email from './Email'
import Files from './Files'

const useStyles = makeStyles(theme => ({
    printTitle: {
        margin: theme.spacing(2),
    },
    icon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    }
}))

function TextSubTabs() {
    const classes = useStyles()
    const { data, docRawUrl, ocrData, printMode, collection, subTab, handleSubTabChange } = useDocument()

    if (!data || !collection || !ocrData) {
        return null
    }

    const hasPreview = docRawUrl && data.content['content-type'] && (
        data.content['content-type'] === 'application/pdf' ||
        PREVIEWABLE_MIME_TYPE_SUFFEXES.some(x => data.content['content-type'].endsWith(x))
    )

    const tabs = [{
        name: 'Extracted from file',
        icon: <Subject />,
        content: <Text content={data.content.text} />,
    }]

    tabs.push(
        ...ocrData.map(({tag, text}) => ({
            name: `OCR ${tag}`,
            icon: <TextFields />,
            content: <Text content={text} />,
        }))
    )

    return (
        <>
            {data.content.filetype === 'email' && (
                <Email />
            )}

            {hasPreview && (
                <Box m={1}>
                    <Preview />
                </Box>
            )}

            {!!data.children?.length && (
                <Expandable
                    defaultOpen
                    highlight={false}
                    title={
                        <>
                            <FolderOutlined className={classes.icon} />
                            Files
                        </>
                    }
                >
                    <Files />
                </Expandable>
            )}

            {!printMode && tabs.length > 1 && (
                <Tabs
                    value={subTab}
                    onChange={handleSubTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tabData, index) => (
                        <Tab
                            key={index}
                            icon={tabData.icon}
                            label={tabData.name}
                        />
                    ))}
                </Tabs>
            )}

            {tabs.map((tabData, index) => (
                <Box key={index}>
                    {printMode && tabs.length > 1 && (
                        <Typography
                            variant="h5"
                            className={classes.printTitle}
                        >
                            {tabData.name}
                        </Typography>
                    )}
                    <TabPanel
                        value={subTab}
                        index={index}
                        alwaysVisible={printMode}
                    >
                        {tabData.content}
                    </TabPanel>
                </Box>
            ))}
        </>
    )
}

export default memo(TextSubTabs)
