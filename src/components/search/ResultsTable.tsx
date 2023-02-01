import { IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cn from 'classnames'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, useState, MouseEvent } from 'react'
import ReactPlaceholder from 'react-placeholder'
import { TextRow } from 'react-placeholder/lib/placeholders'

import { availableColumns } from '../../constants/availableColumns'
import { reactIcons } from '../../constants/icons'
import { AsyncQueryTask } from '../../stores/search/AsyncTaskRunner'
import { Hit } from '../../Types'

import ResultsTableRow from './ResultsTableRow'
import { useSearch } from './SearchProvider'

import type { Theme } from '@mui/material'

const useStyles = makeStyles((theme: Theme) => ({
    table: {
        '& th': {
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            '&.sortable': {
                cursor: 'pointer',
            },
        },
        '& td': {
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        '& tbody tr:hover': {
            backgroundColor: theme.palette.grey[100],
        },
    },
    icon: {
        fontSize: 20,
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
        transition: 'transform .2s ease-in-out',
    },
    iconDown: {
        transform: 'rotate(180deg)',
    },
}))

interface ResultsTableProps {
    queryTask: AsyncQueryTask
}

export const ResultsTable: FC<ResultsTableProps> = observer(({ queryTask }) => {
    const classes = useStyles()
    // @ts-ignore
    const { query, results, resultsLoading, resultsColumns, setResultsColumns, search } = useSearch()

    const size = parseInt(query.size || 10)
    const order = query.order
    const changeOrder = (newOrder: string[]) => {
        search({ order: newOrder, page: 1 })
    }

    const handleClick = (field: string) => () => {
        const index = order?.findIndex(([v]: string[]) => v === field)
        const newOrder = [...(order || [])]
        if (index !== undefined && index !== -1) {
            const [, direction] = order[index]
            if (direction) {
                newOrder[index] = [field]
            } else {
                newOrder.splice(index, 1)
            }
        } else {
            newOrder.push([field, 'desc'])
        }
        changeOrder(newOrder)
    }

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)
    const handleColumnsMenuClick = (event: MouseEvent) => setAnchorEl(event.currentTarget)
    const handleColumnsMenuClose = () => setAnchorEl(null)
    const handleColumnMenuClick = (field: string) => () => {
        setResultsColumns((columns: any[]) => {
            let index = resultsColumns.findIndex(([visibleField]: string[]) => visibleField === field)
            if (index !== -1) {
                columns.splice(index, 1)
                return [...columns]
            } else {
                return Object.entries(availableColumns).filter(([availableField]) => {
                    return !!resultsColumns.find(([visibleField]: string[]) => visibleField === availableField) || availableField === field
                })
            }
        })
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        {resultsColumns.map(([field, { label, align, sortable }]: any[]) => {
                            const index = order?.findIndex(([v]: string[]) => v === field)
                            let orderIcon = null
                            if (index !== undefined && index !== -1) {
                                const [, direction] = order[index]
                                orderIcon = cloneElement(reactIcons.arrowUp, {
                                    className: cn(classes.icon, {
                                        [classes.iconDown]: direction === 'desc',
                                    }),
                                })
                            }
                            return (
                                <TableCell
                                    key={field}
                                    align={align}
                                    className={sortable ? 'sortable' : undefined}
                                    onClick={sortable ? handleClick(field) : undefined}>
                                    {label}
                                    {orderIcon}
                                </TableCell>
                            )
                        })}
                        <TableCell align="right">
                            <IconButton size="small" onClick={handleColumnsMenuClick} data-test="sort-button">
                                {reactIcons.more}
                            </IconButton>

                            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleColumnsMenuClose} data-test="columns-menu">
                                {Object.entries(availableColumns).map(([field, { label }]) => (
                                    <MenuItem
                                        key={field}
                                        value={field}
                                        selected={!!resultsColumns.find(([visibleField]: string[]) => visibleField === field)}
                                        onClick={handleColumnMenuClick(field)}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <ReactPlaceholder
                        showLoadingAnimation
                        ready={!resultsLoading}
                        customPlaceholder={
                            <>
                                {[...Array(size)].map((_v, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={resultsColumns.length + 2}>
                                            <TextRow lineSpacing={0} color="#CDCDCD" style={{ height: 26 }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        }>
                        {!results ? null : results.hits.hits.map((hit: Hit, i: number) => <ResultsTableRow key={hit._id} index={i} hit={hit} />)}
                    </ReactPlaceholder>
                </TableBody>
            </Table>
        </TableContainer>
    )
})
