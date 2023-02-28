import { Fab, Grid } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { reactIcons } from '../../../constants/icons'
import { Expandable } from '../../common/Expandable/Expandable'
import { useSharedStore } from '../../SharedStoreProvider'

import { Pagination } from './Pagination/Pagination'
import { useStyles } from './Results.styles'
import { ResultsGroup } from './ResultsGroup'

export const Results: FC = observer(() => {
    const { classes } = useStyles()
    const {
        searchViewStore: { searchCollections, resultsViewType, setResultsViewType },
        searchResultsStore: { resultsQueryTasks, resultsLoading },
    } = useSharedStore().searchStore

    return (
        <>
            <Grid container>
                <Grid item container justifyContent="flex-end">
                    <Grid item>
                        <Fab
                            size="small"
                            color={resultsViewType === 'list' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setResultsViewType('list')}>
                            {reactIcons.listView}
                        </Fab>
                    </Grid>
                    <Grid item>
                        <Fab
                            size="small"
                            color={resultsViewType === 'table' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setResultsViewType('table')}>
                            {reactIcons.tableView}
                        </Fab>
                    </Grid>
                </Grid>
            </Grid>

            <Pagination />

            {!searchCollections.length ? (
                <i>no collections selected</i>
            ) : (
                <>
                    {Object.keys(resultsQueryTasks).map((collection) => (
                        <ResultsGroup key={collection} collection={collection} />
                    ))}
                    {!resultsLoading && <Pagination />}
                </>
            )}
        </>
    )
})
