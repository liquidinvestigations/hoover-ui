import React, { memo } from 'react'
import { Box, Fab, Grid, LinearProgress, Typography } from '@material-ui/core'
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
    },
    progress: {
        height: 20,
        borderRadius: 5,
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
    progressRoot: {
        backgroundImage: `linear-gradient(
            -45deg,
            rgba(255, 255, 255, .5) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, .5) 50%,
            rgba(255, 255, 255, .5) 75%,
            transparent 75%,
            transparent
        )`,
        backgroundSize: '50px 50px',
        animation: '$move 2s linear infinite',
    },
    '@keyframes move': {
        '0%': {
            backgroundPosition: '0 0',
        },
        '100%': {
            backgroundPosition: '50px 50px',
        }
    }
}))

function Results({ maxCount }) {
    const classes = useStyles()
    const { query, results, resultsTask, resultsLoading, resultsViewType, setResultsViewType } = useSearch()

    let loadingProgress = 5
    if (resultsTask) {
        if (resultsTask.status === 'done') {
            loadingProgress = 100
        } else if (resultsTask.eta.total_sec / resultsTask.initialEta < 1) {
            loadingProgress = Math.max(5, resultsTask.eta.total_sec / resultsTask.initialEta * 100)
        }
    }

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

            {resultsLoading && (
                <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                        <LinearProgress
                            variant="determinate"
                            value={loadingProgress}
                            className={classes.progress}
                            classes={{ root: classes.progressRoot }}
                        />
                    </Box>
                    <Box minWidth={35}>
                        {resultsTask?.eta && (
                            <Typography variant="body2" color="textSecondary">
                                ETA:&nbsp;{resultsTask.eta.total_sec}s
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

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
