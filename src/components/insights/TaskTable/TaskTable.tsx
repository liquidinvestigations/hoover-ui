import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { FC } from 'react'

import { formatTitleCase } from '../../../utils/utils'

import { useStyles } from './TaskTable.styles'

interface TaskTableProps {
    header: string[]
    tasks: string[][]
}

export const TaskTable: FC<TaskTableProps> = ({ header, tasks }) => {
    const { classes } = useStyles()

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
