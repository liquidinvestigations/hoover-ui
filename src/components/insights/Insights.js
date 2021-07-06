import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Collapse, List, ListItem, Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import InsightsTitle from './InsightsTitle'
import TaskErrorsTable from './TaskErrorsTable'
import TaskTable from './TaskTable'
import { useHashState } from '../HashStateProvider'
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
        marginTop: theme.spacing(1),
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
    const [open, setOpen] = useState([])

    useEffect(() => {
        if (hashState?.insights) {
            setOpen(hashState.insights)
        } else {
            setOpen([])
        }
    }, [hashState?.insights])

    const toggle = (name) => () => {
        let state
        setOpen(prevState => {
            let index
            if ((index = prevState.indexOf(name)) > -1) {
                prevState.splice(index, 1)
            } else {
                prevState.push(name)
            }
            state = prevState
            return prevState
        })

        if (!open[name]) {
            setHashState({ insights: state })
        }
    }

    return (
        <List className={classes.list}>
            {collectionsState.map(collection => (
                <Fragment key={collection.name}>
                    <InsightsTitle
                        name={collection.name}
                        open={open.includes(collection.name)}
                        onToggle={toggle(collection.name)}
                    />

                    <Collapse in={open.includes(collection.name)}>
                        <Typography variant="h5" className={classes.sectionTitle}>Tasks</Typography>
                        <TaskTable tasks={collection.stats.task_matrix} />

                        <Typography variant="h5" className={classes.sectionTitle}>Counts</Typography>
                        <Paper>
                            <List>
                                <ListItem><strong>{collection.stats.counts.files}</strong>&nbsp;files</ListItem>
                                <ListItem><strong>{collection.stats.counts.directories}</strong>&nbsp;directories</ListItem>
                                <ListItem><strong>{collection.stats.counts.blob_count}</strong>&nbsp;blobs</ListItem>
                                <ListItem><strong>{humanFileSize(collection.stats.counts.blob_total_size)}</strong>&nbsp;in blob storage</ListItem>
                                <ListItem><strong>{humanFileSize(collection.stats.db_size)}</strong>&nbsp;in database</ListItem>
                            </List>
                        </Paper>

                        <Typography variant="h5" className={classes.sectionTitle}>Task errors</Typography>
                        <TaskErrorsTable errors={collection.stats.error_counts} />

                        <br />
                    </Collapse>
                </Fragment>
            ))}
        </List>
    )
}
