import { IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, useState, MouseEvent } from 'react'

import { availableColumns } from '../../../../../constants/availableColumns'
import { reactIcons } from '../../../../../constants/icons'
import { Hits } from '../../../../../Types'
import { defaultSearchParams } from '../../../../../utils/queryUtils'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { ResultsTableRow } from '../ResultsTableRow/ResultsTableRow'

import { useStyles } from './ResultsTable.styles'

interface ResultsTableProps {
    hits?: Hits
}

export const ResultsTable: FC<ResultsTableProps> = observer(({ hits }) => {
    const { classes, cx } = useStyles()
    const {
        query,
        search,
        searchViewStore: { resultsColumns, setResultsColumns },
    } = useSharedStore().searchStore

    const order = query?.order
    const changeOrder = (newOrder: string[][]) => {
        search({ order: newOrder, page: defaultSearchParams.page })
    }

    const handleClick = (field: string) => () => {
        const index = order?.findIndex(([v]: string[]) => v === field)
        const newOrder = [...(order || [])]
        if (index !== undefined && index !== -1) {
            const [, direction] = order?.[index] || []
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
        let resultsColumnsCopy = resultsColumns.slice()
        const index = resultsColumns.findIndex(([visibleField]) => visibleField === field)

        if (index !== -1) {
            resultsColumnsCopy.splice(index, 1)
            resultsColumnsCopy = [...resultsColumnsCopy]
        } else {
            resultsColumnsCopy = Object.entries(availableColumns).filter(([availableField]) => {
                return !!resultsColumns.find(([visibleField]) => visibleField === availableField) || availableField === field
            })
        }

        setResultsColumns(resultsColumnsCopy)
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
                                const [, direction] = order?.[index] || []
                                orderIcon = cloneElement(reactIcons.arrowUp, {
                                    className: cx(classes.icon, {
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
                                        selected={!!resultsColumns.find(([visibleField]) => visibleField === field)}
                                        onClick={handleColumnMenuClick(field)}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{hits?.hits.map((hit, i) => <ResultsTableRow key={hit._id} index={i} hit={hit} />)}</TableBody>
            </Table>
        </TableContainer>
    )
})
