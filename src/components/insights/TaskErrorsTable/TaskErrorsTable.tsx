import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { FC } from 'react'

import { ErrorCounts } from '../../../Types'
import { formatTitleCase } from '../../../utils/utils'

import { useStyles } from './TaskErrorsTable.styles'

export const TaskErrorsTable: FC<{ errors: ErrorCounts[] }> = ({ errors }) => {
    const { classes } = useStyles()

    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Func</TableCell>
                        <TableCell align="right">Error type</TableCell>
                        <TableCell align="right">Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {errors.map(({ func, error_type, count }) => (
                        <TableRow key={`${func}${error_type}`}>
                            <TableCell>{formatTitleCase(func)}</TableCell>
                            <TableCell align="right">{error_type}</TableCell>
                            <TableCell align="right">{count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
