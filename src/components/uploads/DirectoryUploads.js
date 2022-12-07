import React, { useEffect, useRef, useState } from 'react'
import { Grid, List, ListItem, Paper, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import InsightsTitle from '../insights/InsightsTitle'
import TaskErrorsTable from '../insights/TaskErrorsTable'
import TaskTable from '../insights/TaskTable'
import SplitPaneLayout from '../SplitPaneLayout'
import AggregationsTable from '../insights/AggregationsTable'
import { useSearch } from '../search/SearchProvider'
import { humanFileSize } from '../../utils'
import { getDirectoryUploads, createUploadUrl } from '../../backend/api'
import Histogram from '../insights/Histogram'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { FileInput, StatusBar } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/core/dist/style.css'
import '@uppy/status-bar/dist/style.css'

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
    list: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.light,
    },
    sectionTitle: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[300],
    },
}))

export default function DirectoryUploads(props) {
    const classes = useStyles()

    const [uploadsState, setUploadsState] = useState({'uploads':[]})
    const intervalRef = useRef(0)

    const uppy = new Uppy({
        meta: {},
        restrictions: { maxNumberOfFiles: 1 },
        autoProceed: true,
    })


    uppy.on('file-added', (file) =>{
        uppy.setFileMeta(file.id, {
            name: file.name,
            dirpk: props.directoryId,
            collection: props.collection
        })
    })

    uppy.on('complete', () => {
        getDirectoryUploads(props.collection, props.directoryId)
            .then(data => {
                setUploadsState(data);
            })
    })

    uppy.use(Tus, {
        endpoint: createUploadUrl(),
        retryDelays: [0, 1000, 3000, 5000],
        limit: 3,
    })

    useEffect(() => {
        getDirectoryUploads(props.collection, props.directoryId)
            .then(data => {
                setUploadsState(data);
            })

        intervalRef.current = setInterval(async () => {
            setUploadsState(await getDirectoryUploads(props.collection, props.directoryId))
        }, 60000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [props.collection, props.directoryId])

    const { query, search } = useSearch()

    return (
                <div className={classes.root}>
                    <Grid container spacing={2}>
            <Grid item xs={12}>
            <Typography variant="h5" className={classes.sectionTitle}>Collection: {uploadsState.collection}</Typography>
            </Grid>
            <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionTitle}>Directory Name: {uploadsState.directory_name}</Typography>
            </Grid>
            <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionTitle}>Path: {uploadsState.directory_path}</Typography>
            </Grid>
                        <Grid item xs={12}>
                            <Paper>
                                <Typography variant="h5" className={classes.sectionTitle}>Uploads</Typography>
            <table>
            <thead>
            <tr>
            <th>Started</th>
            <th>Finished</th>
            <th>Uploader</th>
            <th>Filename</th>
            <th>Progress</th>
            <th>Processed</th>
            </tr>
            </thead>
            <tbody>
            {uploadsState.uploads.map((upload, index) =>(
                    <tr key={index}>
                    <td>{upload.started ? upload.started : ''}</td>
                    <td>{upload.finished ? upload.finished : ''}</td>
                    <td>{upload.uploader ? upload.uploader : ''}</td>
                    <td>{upload.filename ? upload.filename : ''}</td>
                    <td>{upload.tasks_done != undefined ? (upload.tasks_done + '/' + upload.tasks_total) : ''}</td>
                    <td>{(upload.processed || upload.processed === false) ? upload.processed.toString() : ''}</td>
                    </tr>
            ))}
        </tbody>
            </table>
                            </Paper>
                        </Grid>
            <Grid item xs={12}>
                  <FileInput
         uppy={uppy}
        pretty={true}
         inputName="files[]"
        locale={{strings: { chooseFiles: 'Choose files to upload'}}}
             />
            <StatusBar
        uppy={uppy}
        hideUploadButton
        hideAfterFinish={false}
        showProgressDetails
            />
            </Grid>
                    </Grid>
                </div>
    )
}
