import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { formatTitleCase } from '../../utils'

const useStyles = makeStyles(theme => ({
    table: {
        '& th': {
            fontWeight: 'bold',
        }
    }
}))

export default function TaskTable({ tasks }) {
    const classes = useStyles()

    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Func</TableCell>
                        <TableCell align="right">ETA</TableCell>
                        <TableCell align="right">ERROR</TableCell>
                        <TableCell align="right">BROKEN</TableCell>
                        <TableCell align="right">PENDING</TableCell>
                        <TableCell align="right">SUCCESS</TableCell>
                        <TableCell align="right">DEFERRED</TableCell>
                        <TableCell align="right">5M_COUNT</TableCell>
                        <TableCell align="right">REMAINING_SIZE</TableCell>
                        <TableCell align="right">5M_AVG_SIZE</TableCell>
                        <TableCell align="right">5M_AVG_WORKERS</TableCell>
                        <TableCell align="right">5M_AVG_DURATION</TableCell>
                        <TableCell align="right">SUCCESS_AVG_SIZE</TableCell>
                        <TableCell align="right">SUCCESS_AVG_DURATION</TableCell>
                        <TableCell align="right">5M_AVG_BYTES_SEC</TableCell>
                        <TableCell align="right">SUCCESS_AVG_BYTES_SEC</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks.map(([task, status]) => (
                        <TableRow key={task}>
                            <TableCell>
                                {formatTitleCase(task)}
                            </TableCell>
                            <TableCell align="right">{status['eta']}</TableCell>
                            <TableCell align="right">{status['error']}</TableCell>
                            <TableCell align="right">{status['broken']}</TableCell>
                            <TableCell align="right">{status['pending']}</TableCell>
                            <TableCell align="right">{status['success']}</TableCell>
                            <TableCell align="right">{status['deferred']}</TableCell>
                            <TableCell align="right">{status['5m_count']}</TableCell>
                            <TableCell align="right">{status['remaining_size']}</TableCell>
                            <TableCell align="right">{status['5m_avg_size']}</TableCell>
                            <TableCell align="right">{status['5m_avg_workers']}</TableCell>
                            <TableCell align="right">{status['5m_avg_duration']}</TableCell>
                            <TableCell align="right">{status['success_avg_size']}</TableCell>
                            <TableCell align="right">{status['success_avg_duration']}</TableCell>
                            <TableCell align="right">{status['5m_avg_bytes_sec']}</TableCell>
                            <TableCell align="right">{status['success_avg_bytes_sec']}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
