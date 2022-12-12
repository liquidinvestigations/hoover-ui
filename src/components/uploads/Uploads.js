import React, { useEffect, useRef, useState } from 'react';
import { Grid, List, ListItem, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import InsightsTitle from '../insights/InsightsTitle';
import TaskErrorsTable from '../insights/TaskErrorsTable';
import TaskTable from '../insights/TaskTable';
import SplitPaneLayout from '../SplitPaneLayout';
import AggregationsTable from '../insights/AggregationsTable';
import { useSearch } from '../search/SearchProvider';
import { humanFileSize } from '../../utils';
import { getUploads } from '../../backend/api';
import Histogram from '../insights/Histogram';

const useStyles = makeStyles((theme) => ({
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
}));

export default function Uploads(collections) {
    const classes = useStyles();

    const [uploadsState, setUploadsState] = useState([]);
    const intervalRef = useRef(0);
    useEffect(() => {
        getUploads()
            .then((data) => {
                const sortedData = data.uploads.sort((a, b) => a.started - b.started)
                setUploadsState(sortedData);
            })
            .catch((error) => setError(error.message));

        intervalRef.current = setInterval(async () => {
            setUploadsState(await getUploads());
        }, 60000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    const { query, search } = useSearch();

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
                                    .map((upload) => (
                                        <tr key={upload.started}>
                                            <td>
                                                {upload.started
                                                    ? upload.started
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.finished
                                                    ? upload.finished
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.uploader
                                                    ? upload.uploader
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.collection
                                                    ? upload.collection
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.directory_id
                                                    ? upload.directory_id
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.directory_path
                                                    ? upload.directory_path
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.filename
                                                    ? upload.filename
                                                    : ''}
                                            </td>
                                            <td>
                                                {upload.processed ||
                                                upload.processed === false
                                                    ? upload.processed.toString()
                                                    : ''}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
