import { Grid, Paper, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import React, { useEffect, useRef, useState } from 'react'

import { getUploads } from '../../backend/api'
import { UploadsState } from '../../Types'

import { useStyles } from './Uploads.styles'

export default function Uploads() {
    const { classes } = useStyles()

    const [uploadsState, setUploadsState] = useState<UploadsState[]>([])
    const intervalRef = useRef<ReturnType<typeof setInterval>>()
    useEffect(() => {
        getUploads().then((data) => {
            setUploadsState(data)
        })

        intervalRef.current = setInterval(async () => {
            setUploadsState(await getUploads())
        }, 60000)

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [])

    return (
        <div className={classes.root}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper>
                        <Typography variant="h5" className={classes.sectionTitle}>
                            <T keyName="uploads">Uploads</T>
                        </Typography>
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <T keyName="started">Started</T>
                                    </th>
                                    <th>
                                        <T keyName="finished">Finished</T>
                                    </th>
                                    <th>
                                        <T keyName="uploader">Uploader</T>
                                    </th>
                                    <th>
                                        <T keyName="collection">Collection</T>
                                    </th>
                                    <th>
                                        <T keyName="directory_id">Directory ID</T>
                                    </th>
                                    <th>
                                        <T keyName="directory_path">Directory Path</T>
                                    </th>
                                    <th>
                                        <T keyName="filename">Filename</T>
                                    </th>
                                    <th>
                                        <T keyName="processed">Processed</T>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadsState
                                    .sort((a, b) => String(a.started).localeCompare(String(b.started)))
                                    .map((upload) => (
                                        <tr key={upload.started}>
                                            <td>{upload.started ? upload.started : ''}</td>
                                            <td>{upload.finished ? upload.finished : ''}</td>
                                            <td>{upload.uploader ? upload.uploader : ''}</td>
                                            <td>{upload.collection ? upload.collection : ''}</td>
                                            <td>{upload.directory_id ? upload.directory_id : ''}</td>
                                            <td>{upload.directory_path ? upload.directory_path : ''}</td>
                                            <td>{upload.filename ? upload.filename : ''}</td>
                                            <td>{upload.processed || upload.processed === false ? upload.processed.toString() : ''}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
