import { Grid, List, ListItem, Paper, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react'

import { collectionsInsights } from '../../backend/api'
import { CollectionData } from '../../Types'
import { humanFileSize } from '../../utils/utils'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import { useSharedStore } from '../SharedStoreProvider'

import { AggregationsTable } from './AggregationsTable/AggregationsTable'
import { Histogram } from './Histogram/Histogram'
import { useStyles } from './Insights.styles'
import { InsightsTitle } from './InsightsTitle/InsightsTitle'
import { TaskErrorsTable } from './TaskErrorsTable/TaskErrorsTable'
import { TaskTable } from './TaskTable/TaskTable'

export const Insights: FC = observer(() => {
    const { classes } = useStyles()

    const { collectionsData, fields, user } = useSharedStore()

    const { query, search } = useSharedStore().searchStore

    useEffect(() => {
        if (query?.collections) {
            setCurrentCollection(collectionsData?.find((collection) => collection.name === query.collections[0]) as CollectionData)
        } else if (collectionsData && fields && user) {
            search({ collections: [collectionsData[0].name], q: '*' })
        }
    }, [query?.collections, collectionsData, fields, user])

    const [currentCollection, setCurrentCollection] = useState(collectionsData?.[0])
    const handleMenuClick = (collection: CollectionData) => () => {
        search({ collections: [collection.name], q: '*' })
    }

    return (
        <SplitPaneLayout
            left={
                <div>
                    {collectionsData?.map((collection) => (
                        <InsightsTitle
                            key={collection.name}
                            name={collection.title}
                            open={currentCollection?.name === collection.name}
                            onClick={handleMenuClick(collection)}
                        />
                    ))}
                </div>
            }>
            <div className={classes.root}>
                {currentCollection && (
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    File types
                                </Typography>
                                <AggregationsTable field="filetype" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Content types
                                </Typography>
                                <AggregationsTable field="content-type" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Email domains
                                </Typography>
                                <AggregationsTable field="email-domains" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    Tags
                                </Typography>
                                <AggregationsTable field="tags" />
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
                )}
            </div>
        </SplitPaneLayout>
    )
})
