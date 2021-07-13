import React from 'react'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSearch } from './SearchProvider'
import ResultsTableRow from './ResultsTableRow'

const useStyles = makeStyles(theme => ({
    table: {
        '& th': {
            fontWeight: 'bold',
        },
        '& td': {
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        '& tbody tr:hover': {
            backgroundColor: theme.palette.grey[100],
        }
    },
}))

export default function ResultsTable() {
    const classes = useStyles()
    const { results } = useSearch()

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            #
                        </TableCell>
                        <TableCell>
                            Filename
                        </TableCell>
                        <TableCell>
                            Collection
                        </TableCell>
                        <TableCell>
                            Path
                        </TableCell>
                        <TableCell align="right">
                            Words
                        </TableCell>
                        <TableCell align="right">
                            Size
                        </TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {results?.hits.hits.map((hit, i) =>
                        <ResultsTableRow hit={hit} index={i} key={hit._id} />
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
