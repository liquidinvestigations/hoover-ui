import { Checkbox, List, ListItem, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import Highlighter from 'react-highlight-words'

import { formatThousands } from '../../../../utils/utils'
import { Loading } from '../../../common/Loading/Loading'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CollectionsFilter.styles'

export const CollectionsFilter: FC = observer(() => {
    const { classes } = useStyles()
    const {
        collectionsData,
        searchStore: {
            searchViewStore: { categoryQuickFilter, searchCollections, handleSearchCollectionsChange, handleAllSearchCollectionsToggle },
            searchResultsStore: { resultsCounts },
        },
    } = useSharedStore()

    return (
        <List dense disablePadding>
            {!collectionsData ? (
                <Loading />
            ) : !collectionsData?.length ? (
                <Typography className={classes.noCollections}>no collections available</Typography>
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
                                />

                                <ListItemText
                                    primary={
                                        !categoryQuickFilter.collections?.length ? (
                                            collection.title
                                        ) : (
                                            <Highlighter
                                                searchWords={[categoryQuickFilter.collections || '']}
                                                autoEscape={true}
                                                textToHighlight={collection.title}
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
                                            {resultsCounts?.[collection.name] && formatThousands(resultsCounts?.[collection.name] || 0)}
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
