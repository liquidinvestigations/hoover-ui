import React, { memo, useState } from 'react'
import Text from './Text'
import { Box, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Subject, TextFields } from '@material-ui/icons'
import TabPanel from './TabPanel'
import Email from './Email'

const useStyles = makeStyles(theme => ({
    printTitle: {
        margin: theme.spacing(2),
    },
}))

function TextSubTabs({ data, ocrData, collection, printMode }) {
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

    let tabIndex = 0

    return (
        <>
            {data.content.filetype === 'email' && (
                <Email
                    doc={data}
                    collection={collection}
                    printMode={printMode}
                />
            )}

            {!printMode && (
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tabData, index) => (
                        <Tab icon={tabData.icon} label={tabData.name} key={index} />
                    ))}
                </Tabs>
            )}

            {tabs.map((tabData, index) => (
                <Box key={index}>
                    {printMode && <Typography variant="h5" className={classes.printTitle}>{tabData.name}</Typography>}
                    <TabPanel value={tab} index={tabIndex++} alwaysVisible={printMode}>
                        {tabData.content}
                    </TabPanel>
                </Box>
            ))}
        </>
    )
}

export default memo(TextSubTabs)
