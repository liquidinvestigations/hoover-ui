import { Grid, Paper, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { getUploads } from '../../backend/api'

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

export default function Uploads() {
    const { classes } = useStyles()

    const [uploadsState, setUploadsState] = useState([])
    const intervalRef = useRef(0)
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
                            Uploads
                        </Typography>
                        <table>
                            <thead>
                                <tr>
                                    <th>Started</th>
                                    <th>Finished</th>
                                    <th>Uploader</th>
                                    <th>Collection</th>
                                    <th>Directory ID</th>
                                    <th>Directory Path</th>
                                    <th>Filename</th>
                                    <th>Processed</th>
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
