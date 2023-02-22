import { Checkbox, List, ListItem, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import Highlighter from 'react-highlight-words'

import { formatThousands } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CollectionsFilter.styles'

export const CollectionsFilter: FC = observer(() => {
    const classes = useStyles()
    const {
        collectionsData,
        searchStore: {
            searchViewStore: { categoryQuickFilter, searchCollections, handleSearchCollectionsChange, handleAllSearchCollectionsToggle },
            searchResultsStore: { resultsQueryTasks },
        },
    } = useSharedStore()

    return (
        <List dense disablePadding>
            {!collectionsData?.length ? (
                <Typography>no collections available</Typography>
            ) : (
                <>
                    {collectionsData
                        .filter((collection) => collection.name.includes(categoryQuickFilter.collections || ''))
                        .map((collection) => (
                            <ListItem key={collection.name} role={undefined} dense button onClick={handleSearchCollectionsChange(collection.name)}>
                                <Checkbox
                                    size="small"
                                    tabIndex={-1}
                                    disableRipple
                                    classes={{ root: classes.checkbox }}
                                    checked={searchCollections.includes(collection.name)}
                                    onChange={handleSearchCollectionsChange(collection.name)}
                                />

                                <ListItemText
                                    primary={
                                        !categoryQuickFilter.collections?.length ? (
                                            collection.name
                                        ) : (
                                            <Highlighter
                                                searchWords={[categoryQuickFilter.collections || '']}
                                                autoEscape={true}
                                                textToHighlight={collection.name}
                                            />
                                        )
                                    }
                                    secondary={collection.stats.progress_str}
                                    className={classes.label}
                                    secondaryTypographyProps={{
                                        className: classes.progress,
                                    }}
                                />

                                <ListItemText
                                    primary={
                                        <Typography variant="caption">
                                            {resultsQueryTasks?.[collection.name]?.data?.result?.count_by_index?.[collection.name] &&
                                                formatThousands(
                                                    resultsQueryTasks?.[collection.name]?.data?.result?.count_by_index?.[collection.name] || 0
                                                )}
                                        </Typography>
                                    }
                                    className={classes.docCount}
                                    disableTypography
                                />
                            </ListItem>
                        ))}
                    {collectionsData.length > 1 && (
                        <ListItem dense button onClick={handleAllSearchCollectionsToggle}>
                            <Checkbox
                                size="small"
                                tabIndex={-1}
                                disableRipple
                                classes={{ root: classes.checkbox }}
                                checked={collectionsData.length === searchCollections.length}
                                onChange={handleAllSearchCollectionsToggle}
                            />

                            <ListItemText primary="Select all" />
                        </ListItem>
                    )}
                </>
            )}
        </List>
    )
})
