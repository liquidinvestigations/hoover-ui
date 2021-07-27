import React, { memo, useState } from 'react'
import ReactPlaceholder from 'react-placeholder'
import { Fab, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Pagination from './Pagination'
import ResultsList from './ResultsList'
import ResultsTable from './ResultsTable'
import { useSearch } from './SearchProvider'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles(theme => ({
    viewTypeIcon: {
        flex: 'none',
        boxShadow: 'none',
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    }
}))

function Results({ maxCount }) {
    const classes = useStyles()
    const { query, results, resultsViewType, setResultsViewType } = useSearch()

    return (
        <>
            <Pagination maxCount={maxCount} />
            <Grid container>
                <Grid item container justify="flex-end">
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
            {!!results && !query.collections?.length ?
                <i>no collections selected</i> :
                resultsViewType === 'list' ? <ResultsList /> : <ResultsTable />
            }

            {!!results?.hits.hits.length &&
                <Pagination maxCount={maxCount} />
            }
        </>
    )
}

export default memo(Results)
