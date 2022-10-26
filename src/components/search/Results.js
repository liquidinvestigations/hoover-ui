import React, { memo } from 'react'
import { Box, Fab, Fade, Grid, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Pagination from './Pagination'
import ResultsList from './ResultsList'
import ResultsTable from './ResultsTable'
import { useSearch } from './SearchProvider'
import { reactIcons } from '../../constants/icons'
import ResultsProgress from './ResultsProgress'

const useStyles = makeStyles(theme => ({
    viewTypeIcon: {
        flex: 'none',
        boxShadow: 'none',
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },

}))

function Results({ maxCount }) {
    const classes = useStyles()
    const { query, results, resultsTask, resultsLoading, resultsViewType, setResultsViewType } = useSearch()

    let loadingETA = Number.MAX_SAFE_INTEGER
    if (resultsTask) {
        if (resultsTask.status === 'done') {
            loadingETA = 0
        } else if (resultsTask.eta.total_sec / resultsTask.initialEta < 1) {
            loadingETA = Math.min(resultsTask.initialEta, resultsTask.eta.total_sec)
        }
    }

    return (
        <>
            <Pagination maxCount={maxCount} />
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

            <Fade in={resultsLoading} unmountOnExit>
                <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                        <ResultsProgress eta={loadingETA} />
                    </Box>
                    <Box minWidth={35}>
                        {resultsTask?.eta && (
                            <Typography variant="body2" color="textSecondary">
                                ETA:&nbsp;{resultsTask.eta.total_sec}s
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Fade>

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
