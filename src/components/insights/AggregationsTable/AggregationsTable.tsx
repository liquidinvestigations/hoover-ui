import { ButtonBase, List, ListItem, ListItemText, ListItemSecondaryAction, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import ReactPlaceholder from 'react-placeholder'

import { SourceField } from '../../../Types'
import { createSearchUrl, Term } from '../../../utils/queryUtils'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './AggregationsTable.styles'

export const AggregationsTable: FC<{ field: SourceField }> = observer(({ field }) => {
    const { classes } = useStyles()
    const {
        query,
        searchAggregationsStore: { aggregations, aggregationsLoading },
    } = useSharedStore().searchStore

    const loading = aggregationsLoading?.[field]
    const buckets = aggregations?.[field]?.values.buckets?.slice(0, 10)

    const handleNewSearch = (term: string) => () => {
        window.open(createSearchUrl(term, field, query?.collections as string | string[]))
    }

    return (
        <List dense>
            <ReactPlaceholder showLoadingAnimation ready={!loading} type="text" rows={10}>
                {buckets?.length ? (
                    buckets.map(({ key, doc_count }) => (
                        <ListItem key={key} component={ButtonBase} className={classes.bucket} onClick={handleNewSearch(key)}>
                            <ListItemText primary={key} />
                            <ListItemSecondaryAction>{doc_count}</ListItemSecondaryAction>
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText primary="Not found" />
                    </ListItem>
                )}
            </ReactPlaceholder>
        </List>
    )
})
