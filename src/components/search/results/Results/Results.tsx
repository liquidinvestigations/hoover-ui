import { Fab, Grid } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'
import { Pagination } from '../Pagination/Pagination'
import { ResultsGroup } from '../ResultsGroup/ResultsGroup'

import { useStyles } from './Results.styles'

export const Results: FC = observer(() => {
    const { classes } = useStyles()
    const {
        searchViewStore: { searchCollections, resultsViewType, setResultsViewType },
        searchResultsStore: { results, resultsLoadingETA, resultsSortCompareFn },
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
                            onClick={() => setResultsViewType('list')}
                        >
                            {reactIcons.listView}
                        </Fab>
                    </Grid>
                    <Grid item>
                        <Fab
                            size="small"
                            color={resultsViewType === 'table' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setResultsViewType('table')}
                        >
                            {reactIcons.tableView}
                        </Fab>
                    </Grid>
                </Grid>
            </Grid>

            <Pagination />

            {!searchCollections.length ? (
                <i>
                    <T keyName="no_collections_selected">no collections selected</T>
                </i>
            ) : (
                <>
                    {results.map(({ collection, hits }) => (
                        <ResultsGroup key={collection} collection={collection} hits={hits} />
                    ))}
                    {!Object.keys(resultsLoadingETA).length && <Pagination />}
                </>
            )}
        </>
    )
})
