import React, { memo, useState } from 'react'
import Text from './Text'
import { Box, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { FolderOutlined, Subject, TextFields } from '@material-ui/icons'
import Expandable from '../Expandable'
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

function TextSubTabs({ data, ocrData, collection, printMode, fullPage, docUrl, baseUrl }) {
    const classes = useStyles()

    const [tab, setTab] = useState(ocrData?.length ? 1 : 0)
    const handleTabChange = (event, newValue) => setTab(newValue)

    if (!data || !collection || !ocrData) {
        return null
    }

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
                <Email
                    doc={data}
                    collection={collection}
                    printMode={printMode}
                />
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
                    <Files
                        data={data.children}
                        page={data.children_page}
                        hasNextPage={data.children_has_next_page}
                        fullPage={fullPage}
                        docUrl={docUrl}
                        baseUrl={baseUrl}
                    />
                </Expandable>
            )}

            {!printMode && tabs.length > 1 && (
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
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
                        value={tab}
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
