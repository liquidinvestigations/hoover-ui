import '@uppy/core/dist/style.css'
import '@uppy/file-input/dist/style.css'
import '@uppy/status-bar/dist/style.css'

import { Grid, Paper, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import Uppy from '@uppy/core'
import { FileInput, StatusBar } from '@uppy/react'
import Tus from '@uppy/tus'
import React, { useEffect, useRef, useState, memo, FC } from 'react'

import { getDirectoryUploads, createUploadUrl } from '../../../backend/api'
import { DirectoryUploadsState } from '../../../Types'

import { useStyles } from './DirectoryUploads.styles'

interface DirectoryUploadsProps {
    collection?: string | string[]
    directoryId?: string | string[]
}

export const DirectoryUploads: FC<DirectoryUploadsProps> = ({ collection, directoryId }) => {
    const { t } = useTranslate()
    const { classes } = useStyles()

    const [uploadsState, setUploadsState] = useState<DirectoryUploadsState>({ uploads: [] })
    const intervalRef = useRef<ReturnType<typeof setInterval>>()

    const uppyRef = useRef<Uppy | null>(null)

    useEffect(() => {
        if (uppyRef.current === null && collection && !Array.isArray(collection) && directoryId && !Array.isArray(directoryId)) {
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
                uppyRef.current?.setFileMeta(file.id, {
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

        return () => uppyRef.current?.close()
    }, [directoryId, collection]) // The empty array ensures that this effect only runs on mount.

    useEffect(() => {
        if (collection && !Array.isArray(collection) && directoryId && !Array.isArray(directoryId)) {
            getDirectoryUploads(collection, directoryId).then((data) => {
                setUploadsState(data)
            })

            intervalRef.current = setInterval(async () => {
                setUploadsState(await getDirectoryUploads(collection, directoryId))
            }, 10000)
        }

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
                            <T keyName="collection">Collection</T>: {uploadsState.collection}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            <T keyName="directory">Directory</T>: {uploadsState.directory_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            <T keyName="path">Path</T>: {uploadsState.directory_path}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper>
                            <Typography variant="h5" className={classes.sectionTitle}>
                                <T keyName="uploads">Uploads</T>
                            </Typography>
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            <T keyName="filename">Filename</T>
                                        </th>
                                        <th>
                                            <T keyName="uploader">Uploader</T>
                                        </th>
                                        <th>
                                            <T keyName="started">Started</T>
                                        </th>
                                        <th>
                                            <T keyName="finished">Finished</T>
                                        </th>
                                        <th>
                                            <T keyName="progress">Progress</T>
                                        </th>
                                        <th>
                                            <T keyName="processed">Processed</T>
                                        </th>
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
                                            chooseFiles: t('choose_file_to_upload', 'Choose file to upload'),
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
