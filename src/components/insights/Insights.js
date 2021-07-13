import React, { useEffect, useRef, useState } from 'react'
import { List, ListItem, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import InsightsTitle from './InsightsTitle'
import TaskErrorsTable from './TaskErrorsTable'
import TaskTable from './TaskTable'
import { useHashState } from '../HashStateProvider'
import SplitPaneLayout from '../SplitPaneLayout'
import { humanFileSize } from '../../utils'
import { collectionsInsights } from '../../backend/api'

const useStyles = makeStyles(theme => ({
    list: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[100],
    },
    sectionTitle: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[300],
    }
}))

export default function Insights({ collections }) {
    const classes = useStyles()

    const [collectionsState, setCollectionsState] = useState(collections)
    const intervalRef = useRef(0)
    useEffect(() => {
        intervalRef.current = setInterval(async () => {
            setCollectionsState(await collectionsInsights())
        }, 60000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [])

    const { hashState, setHashState } = useHashState()
    useEffect(() => {
        if (hashState?.insights) {
            setCurrentCollection(collections.find(collection => collection.name === hashState.insights))
        } else {
            setCurrentCollection(collections[0])
        }
    }, [hashState?.insights])

    const [currentCollection, setCurrentCollection] = useState(collections[0])
    const handleMenuClick = collection => () => {
        setCurrentCollection(collection)
        setHashState({ insights: collection.name })
    }

    return (
        <SplitPaneLayout
            left={
                <div>
                    {collectionsState.map(collection => (
                        <InsightsTitle
                            key={collection.name}
                            name={collection.name}
                            open={currentCollection?.name === collection.name}
                            onClick={handleMenuClick(collection)}
                        />
                    ))}
                </div>
            }
        >
            {currentCollection && (
                <div>
                    <Typography variant="h5" className={classes.sectionTitle}>Tasks</Typography>
                    <TaskTable tasks={currentCollection.stats.task_matrix} />

                    <Typography variant="h5" className={classes.sectionTitle}>Counts</Typography>
                    <List>
                        <ListItem><strong>{currentCollection.stats.counts.files}</strong>&nbsp;files</ListItem>
                        <ListItem><strong>{currentCollection.stats.counts.directories}</strong>&nbsp;directories</ListItem>
                        <ListItem><strong>{currentCollection.stats.counts.blob_count}</strong>&nbsp;blobs</ListItem>
                        <ListItem><strong>{humanFileSize(currentCollection.stats.counts.blob_total_size)}</strong>&nbsp;in blob storage</ListItem>
                        <ListItem><strong>{humanFileSize(currentCollection.stats.db_size)}</strong>&nbsp;in database</ListItem>
                    </List>

                    <Typography variant="h5" className={classes.sectionTitle}>Task errors</Typography>
                    <TaskErrorsTable errors={currentCollection.stats.error_counts} />
                </div>
            )}
        </SplitPaneLayout>
    )
}
