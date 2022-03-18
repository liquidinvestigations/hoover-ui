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

export default function TaskTable({header, tasks}) {
    const classes = useStyles()

    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {header.map((head) => (<TableCell align="right">{head}</TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks.map(([task, ...status]) => (
                        <TableRow key={task}>
                            <TableCell>
                                {formatTitleCase(task)}
                            </TableCell>
                            {status.map((cell) => (<TableCell align="right">{cell}</TableCell>))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
