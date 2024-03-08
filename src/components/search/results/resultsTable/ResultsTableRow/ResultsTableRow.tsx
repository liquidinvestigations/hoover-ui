import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../../../../constants/icons'
import { useSharedStore } from '../../../../SharedStoreProvider'

import { useResultsTableRow } from './hooks/useResultsTableRow'
import { useStyles } from './ResultsTableRow.styles'
import { ResultsTableRowProps } from './ResultsTableRow.types'

export const ResultsTableRow: FC<ResultsTableRowProps> = observer(({ hit, index }) => {
    const { classes, cx } = useStyles()
    const {
        searchViewStore: { resultsColumns },
    } = useSharedStore().searchStore
    const { formatField, start, nodeRef, isPreview, url, downloadUrl, handleResultClick } = useResultsTableRow(hit)

    return (
        <TableRow data-testid="results-table-row" ref={nodeRef} onClick={handleResultClick} className={cx({ [classes.selected]: isPreview })}>
            <TableCell>{start + index}</TableCell>
            {resultsColumns.map(([field, { align, path, format }]) => (
                <TableCell key={field} align={align}>
                    {formatField(field, path, format)}
                </TableCell>
            ))}
            <TableCell>
                <Tooltip title="Open in new tab">
                    <IconButton size="small" style={{ marginRight: 15 }}>
                        <a href={url} target="_blank" rel="noreferrer" className={classes.buttonLink}>
                            {cloneElement(reactIcons.openNewTab, { className: classes.actionIcon })}
                        </a>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download original file">
                    <IconButton size="small">
                        <a href={downloadUrl} className={classes.buttonLink}>
                            {cloneElement(reactIcons.downloadOutlined, { className: classes.actionIcon })}
                        </a>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
})
