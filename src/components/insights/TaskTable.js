import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { formatTitleCase } from '../../utils/utils'

const useStyles = makeStyles((theme) => ({
    table: {
        '& th': {
            fontWeight: 'bold',
        },
    },
}))

export default function TaskTable({ header, tasks }) {
    const classes = useStyles()

    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        {header.map((head, index) => (
                            <TableCell key={index} align="right">
                                {head}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks.map(([task, ...status]) => (
                        <TableRow key={task}>
                            <TableCell>{formatTitleCase(task)}</TableCell>
                            {status.map((cell, index) => (
                                <TableCell key={index} align="right">
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
