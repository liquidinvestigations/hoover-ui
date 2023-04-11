import { Grid, List, ListItem, Paper, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { collectionsInsights } from '../../backend/api'
import { humanFileSize } from '../../utils/utils'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import { useSearch } from '../search/SearchProvider'

import AggregationsTable from './AggregationsTable'
import Histogram from './Histogram'
import InsightsTitle from './InsightsTitle'
import TaskErrorsTable from './TaskErrorsTable'
import TaskTable from './TaskTable'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    list: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[100],
    },
    sectionTitle: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[300],
    },
}))

export default function Insights({ collectionsData }) {
    const { classes } = useStyles()

    const [collectionsState, setCollectionsState] = useState(collectionsData)
    const intervalRef = useRef(0)
    useEffect(() => {
        if (collectionsState) {
            search({ collections: [collectionsState[0].name] })
        }

        intervalRef.current = setInterval(async () => {
            setCollectionsState(await collectionsInsights())
        }, 60000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [])

    const { query, search } = useSearch()

    useEffect(() => {
        if (query?.collections) {
            setCurrentCollection(collectionsData.find((collection) => collection.name === query.collections[0]))
        } else {
            search({ collections: [collectionsState[0].name] })
        }
    }, [query?.collections])

    const [currentCollection, setCurrentCollection] = useState(collectionsData[0])
    const handleMenuClick = (collection) => () => {
        search({ collections: [collection.name] })
    }

    return (
        <SplitPaneLayout
            left={
                <div>
                    {collectionsState.map((collection) => (
                        <InsightsTitle
                            key={collection.name}
                            name={collection.title}
                            open={currentCollection?.name === collection.name}
                            onClick={handleMenuClick(collection)}
                        />
                    ))}
                </div>
            }>
            {currentCollection && (
                <div className={classes.root}>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    File types
                                </Typography>
                                <AggregationsTable aggregation="filetype" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Content types
                                </Typography>
                                <AggregationsTable aggregation="content-type" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Email domains
                                </Typography>
                                <AggregationsTable aggregation="email-domains" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Tags
                                </Typography>
                                <AggregationsTable aggregation="tags" />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Years
                                </Typography>
                                <Histogram />
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Counts
                                </Typography>
                                <List>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.files}</strong>&nbsp;files
                                    </ListItem>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.directories}</strong>&nbsp;directories
                                    </ListItem>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.blob_count}</strong>&nbsp;blobs
                                    </ListItem>
                                    <ListItem>
                                        <strong>{humanFileSize(currentCollection.stats.counts.blob_total_size)}</strong>&nbsp;in blob storage
                                    </ListItem>
                                    <ListItem>
                                        <strong>{humanFileSize(currentCollection.stats.db_size)}</strong>&nbsp;in database
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Task errors
                                </Typography>
                                <TaskErrorsTable errors={currentCollection.stats.error_counts} />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Tasks
                                </Typography>
                                <TaskTable header={currentCollection.stats.task_matrix_header} tasks={currentCollection.stats.task_matrix} />
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            )}
        </SplitPaneLayout>
    )
}
