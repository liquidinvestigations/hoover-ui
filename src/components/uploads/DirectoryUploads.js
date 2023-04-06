import { Grid, Paper, Typography } from '@mui/material'
import Uppy from '@uppy/core'
import { FileInput, StatusBar } from '@uppy/react'
import Tus from '@uppy/tus'
import React, { useEffect, useRef, useState, memo } from 'react'
import { makeStyles } from 'tss-react/mui'

import { getDirectoryUploads, createUploadUrl } from '../../backend/api'

import '@uppy/core/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/status-bar/dist/style.css'

const useStyles = makeStyles()((theme) => ({
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

export default function DirectoryUploads({ collection, directoryId }) {
    const { classes } = useStyles()

    const [uploadsState, setUploadsState] = useState({ uploads: [] })
    const intervalRef = useRef(0)

    const uppyRef = useRef(null)

    useEffect(() => {
        if (uppyRef.current === null) {
            uppyRef.current = new Uppy({
                meta: {},
                restrictions: { maxNumberOfFiles: null },
                autoProceed: true,
                allowMultipleUploadBatches: true,
            })
            uppyRef.current.use(Tus, {
                endpoint: createUploadUrl(),
                retryDelays: [0, 1000, 3000, 5000],
                limit: 1,
                // needs to match the chunksize of the client
                chunkSize: 5242880,
            })
            uppyRef.current.on('file-added', (file) => {
                uppyRef.current.setFileMeta(file.id, {
                    name: file.name,
                    dirpk: directoryId,
                    collection: collection,
                })
            })
            uppyRef.current.on('complete', () => {
                getDirectoryUploads(collection, directoryId).then((data) => {
                    setUploadsState(data)
                })
            })
        }

        return () => uppyRef.current.close()
    }, [directoryId, collection]) // The empty array ensures that this effect only runs on mount.

    useEffect(() => {
        getDirectoryUploads(collection, directoryId).then((data) => {
            setUploadsState(data)
        })

        intervalRef.current = setInterval(async () => {
            setUploadsState(await getDirectoryUploads(collection, directoryId))
        }, 10000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [collection, directoryId])

    const MemoizedStatusBar = memo(StatusBar)

    return (
        <>
            <div className={classes.root}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            Collection: {uploadsState.collection}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            Directory Name: {uploadsState.directory_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            Path: {uploadsState.directory_path}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper>
                            <Typography variant="h5" className={classes.sectionTitle}>
                                Uploads
                            </Typography>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Filename</th>
                                        <th>Uploader</th>
                                        <th>Started</th>
                                        <th>Finished</th>
                                        <th>Progress</th>
                                        <th>Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploadsState.uploads
                                        .sort((a, b) => String(a.started).localeCompare(String(b.started)))
                                        .map((upload) => (
                                            <tr key={upload.started}>
                                                <td>{upload.filename ? upload.filename : ''}</td>
                                                <td>{upload.uploader ? upload.uploader : ''}</td>
                                                <td>{upload.started ? upload.started : ''}</td>
                                                <td>{upload.finished ? upload.finished : ''}</td>
                                                <td>{upload.tasks_done !== undefined ? upload.tasks_done + '/' + upload.tasks_total : ''}</td>
                                                <td>{upload.processed || upload.processed === false ? upload.processed.toString() : ''}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        {uppyRef.current !== null ? (
                            <>
                                <FileInput
                                    uppy={uppyRef.current}
                                    pretty={true}
                                    inputName="files[]"
                                    locale={{
                                        strings: {
                                            chooseFiles: 'Choose file to upload',
                                        },
                                    }}
                                />
                                <MemoizedStatusBar uppy={uppyRef.current} hideUploadButton hideAfterFinish={false} showProgressDetails />
                            </>
                        ) : null}
                    </Grid>
                </Grid>
            </div>
        </>
    )
}
