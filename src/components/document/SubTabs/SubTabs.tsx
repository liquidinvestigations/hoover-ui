import { Box, Tab, Tabs } from '@mui/material'
import { observer } from 'mobx-react-lite'

import { Loading } from '../../common/Loading/Loading'
import { useSharedStore } from '../../SharedStoreProvider'
import { TabPanel } from '../TabPanel/TabPanel'

import { Email } from './components/Email/Email'
import { Text } from './components/Text/Text'
import { useStyles } from './SubTabs.styles'

export const SubTabs = observer(() => {
    const { classes } = useStyles()
    const {
        printMode,
        documentStore: {
            tabs,
            data,
            ocrData,
            collection,
            subTab,
            handleSubTabChange,
            documentSearchStore: { query, textSearchStore },
        },
    } = useSharedStore()

    if (!data || !collection || !ocrData) {
        return null
    }

    return (
        <>
            {!printMode && tabs.length > 1 && (
                <Box>
                    <Tabs value={subTab} onChange={handleSubTabChange} variant="scrollable" scrollButtons="auto">
                        {tabs.map(({ icon, name }, index) => {
                            const textSubTabSearchCount = textSearchStore.searchResults[index]?.occurrenceCount || 0
                            return (
                                <Tab
                                    key={index}
                                    icon={icon}
                                    iconPosition="start"
                                    label={
                                        <>
                                            {name}
                                            {query && query.length > 2 && (
                                                <span className={classes.searchCount}>
                                                    {textSearchStore.loading ? (
                                                        <Loading size={16} />
                                                    ) : (
                                                        <span className={`total-count${!textSubTabSearchCount ? ' no-results' : ''}`}>
                                                            {textSubTabSearchCount}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </>
                                    }
                                />
                            )
                        })}
                    </Tabs>
                </Box>
            )}

            <Box className={classes.subTab} id="text-sub-tab">
                {data.content.filetype === 'email' && <Email />}

                {tabs.map(({ name, content }, index) => (
                    <TabPanel key={name.toString()} value={subTab} index={index} alwaysVisible={printMode} name={name}>
                        <Text content={(query && textSearchStore.searchResults[index]?.highlightedText) || content} />
                    </TabPanel>
                ))}
            </Box>
        </>
    )
})
