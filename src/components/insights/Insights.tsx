import { Grid, List, ListItem, Paper, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'

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
    }, [query?.collections, collectionsData, fields, user, search])

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
                                    <T keyName="file_types">File types</T>
                                </Typography>
                                <AggregationsTable field="filetype" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="content_types">Content types</T>
                                </Typography>
                                <AggregationsTable field="content-type" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="email_domains">Email domains</T>
                                </Typography>
                                <AggregationsTable field="email-domains" />
                            </Paper>
                        </Grid>

                        <Grid item xs={3}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="tags">Tags</T>
                                </Typography>
                                <AggregationsTable field="tags" />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="years">Years</T>
                                </Typography>
                                <Histogram />
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="counts">Counts</T>
                                </Typography>
                                <List>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.files}</strong>&nbsp;<T keyName="counts_files">files</T>
                                    </ListItem>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.directories}</strong>&nbsp;
                                        <T keyName="counts_directories">directories</T>
                                    </ListItem>
                                    <ListItem>
                                        <strong>{currentCollection.stats.counts.blob_count}</strong>&nbsp;<T keyName="counts_blobs">blobs</T>
                                    </ListItem>
                                    <ListItem>
                                        <strong>{humanFileSize(currentCollection.stats.counts.blob_total_size)}</strong>&nbsp;
                                        <T keyName="counts_in_blob_storage">in blob storage</T>
                                    </ListItem>
                                    <ListItem>
                                        <strong>{humanFileSize(currentCollection.stats.db_size)}</strong>&nbsp;
                                        <T keyName="counts_in_database">in database</T>
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="task_errors">Task errors</T>
                                </Typography>
                                <TaskErrorsTable errors={currentCollection.stats.error_counts} />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>
                                    <T keyName="tasks">Tasks</T>
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
