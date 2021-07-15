import React, { cloneElement, useState } from 'react'
import cn from 'classnames'
import ReactPlaceholder from 'react-placeholder'
import { TextRow } from 'react-placeholder/lib/placeholders'
import {
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSearch } from './SearchProvider'
import ResultsTableRow from './ResultsTableRow'
import { availableColumns } from '../../constants/availableColumns'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles(theme => ({
    table: {
        '& th': {
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            '&.sortable': {
                cursor: 'pointer',
            }
        },
        '& td': {
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        '& tbody tr:hover': {
            backgroundColor: theme.palette.grey[100],
        }
    },
    icon: {
        fontSize: 20,
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
        transition: 'transform .5s ease-in-out',
    },
    iconDown: {
        transform: 'rotate(180deg)',
    },
}))

export default function ResultsTable() {
    const classes = useStyles()
    const { query, results, resultsLoading, resultsColumns, setResultsColumns, search } = useSearch()

    const size = parseInt(query.size || 10)
    const order = query.order
    const changeOrder = newOrder => {
        search({ order: newOrder, page: 1 })
    }

    const handleClick = field => () => {
        const index = order?.findIndex(([v]) => v === field)
        const newOrder = [...(order || [])]
        if (index !== undefined && index !== -1) {
            const [,direction] = order[index]
            if (direction) {
                newOrder[index] = [field]
            } else {
                newOrder[index] = [field, 'desc']
            }
        } else {
            newOrder.push([field, 'desc'])
        }
        changeOrder(newOrder)
    }

    const [anchorEl, setAnchorEl] = useState(null)
    const handleColumnsMenuClick = event => setAnchorEl(event.currentTarget)
    const handleColumnsMenuClose = () => setAnchorEl(null)
    const handleColumnMenuClick = field => () => {
        setResultsColumns(columns => {
            let index = resultsColumns.findIndex(([visibleField]) => visibleField === field)
            if (index !== -1) {
                columns.splice(index, 1)
                return [...columns]
            } else {
                return Object.entries(availableColumns).filter(([availableField, { hidden }]) => {
                    return !!resultsColumns.find(([visibleField]) => visibleField === availableField) || availableField === field
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
                        {resultsColumns.map(([field, { label, align, sortable }]) => {
                                const index = order?.findIndex(([v]) => v === field)
                                let orderIcon = null
                                if (index !== undefined && index !== -1) {
                                    const [,direction] = order[index]
                                    orderIcon = cloneElement(reactIcons.arrowUp, {
                                        className: cn(classes.icon, {
                                            [classes.iconDown]: direction === 'desc'
                                        })
                                    })
                                }
                                return (
                                    <TableCell
                                        key={field}
                                        align={align}
                                        className={sortable ? 'sortable' : null}
                                        onClick={sortable ? handleClick(field) : null}
                                    >
                                        {label}
                                        {orderIcon}
                                    </TableCell>
                                )
                            })}
                        <TableCell align="right">
                            <IconButton
                                size="small"
                                onClick={handleColumnsMenuClick}
                                data-test="sort-button"
                            >
                                {reactIcons.more}
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleColumnsMenuClose}
                                data-test="columns-menu"
                            >
                                {Object.entries(availableColumns).map(([field, { label }]) => (
                                    <MenuItem
                                        key={field}
                                        value={field}
                                        selected={!!resultsColumns.find(([visibleField]) => visibleField === field)}
                                        onClick={handleColumnMenuClick(field)}
                                    >
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
                            [...Array(size)].map((v, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={resultsColumns.length + 2}>
                                        <TextRow lineSpacing={0} color="#CDCDCD" style={{ height: 26 }} />
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    >
                        {results?.hits.hits.map((hit, i) =>
                            <ResultsTableRow
                                key={hit._id}
                                index={i}
                                hit={hit}
                            />
                        )}
                    </ReactPlaceholder>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
