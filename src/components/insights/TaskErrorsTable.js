import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { formatTitleCase } from '../../utils'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    table: {
        '& th': {
            fontWeight: 'bold',
        },
    },
}))

export default function TaskErrorsTable({ errors }) {
    const classes = useStyles()

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
                        <TableRow key={func}>
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
