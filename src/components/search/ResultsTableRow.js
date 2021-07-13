import React, { cloneElement, useEffect, useRef } from 'react'
import cn from 'classnames'
import { IconButton, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSearch } from './SearchProvider'
import { useHashState } from '../HashStateProvider'
import { createDownloadUrl } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { documentViewUrl, getPreviewParams, getTypeIcon, humanFileSize, truncatePath } from '../../utils'

const useStyles = makeStyles(theme => ({
    selected: {
        boxShadow: `inset 0 0 0 2px ${theme.palette.secondary.main}`,

        '& td': {
            borderBottomColor: theme.palette.secondary.main,
        }
    },
    infoIcon: {
        fontSize: 20,
        verticalAlign: 'middle',
        color: theme.palette.grey[500],
        marginRight: theme.spacing(0.5),
    },
    actionIcon: {
        fontSize: 20,
        color: theme.palette.grey[600],
    },
    buttonLink: {
        lineHeight: 0,
    },
}))

export default function ResultsTableRow({ hit, index }) {
    const classes = useStyles()
    const { query } = useSearch()
    const start = 1 + (query.page - 1) * query.size

    const nodeRef = useRef()
    const { hashState, setHashState } = useHashState()

    const url = documentViewUrl(hit)
    const fields = hit._source || {}
    const collection = hit._collection || ''
    const downloadUrl = createDownloadUrl(url, fields.filename)
    const isPreview = collection === hashState.preview?.c && hit._id === hashState.preview?.i

    const handleResultClick = () => {
        setHashState({ ...getPreviewParams(hit), tab: undefined, subTab: undefined, previewPage: undefined })
    }

    useEffect(() => {
        if (isPreview && 'scrollIntoView' in nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [isPreview])

    return (
        <TableRow
            ref={nodeRef}
            onClick={handleResultClick}
            className={cn({ [classes.selected]: isPreview })}
        >
            <TableCell>
                {start + index}
            </TableCell>
            <TableCell>
                {cloneElement(reactIcons[getTypeIcon(fields.filetype)], { className: classes.infoIcon })}
                {fields.filename}
            </TableCell>
            <TableCell>
                {collection}
            </TableCell>
            <TableCell>
                {truncatePath(fields.path)}
            </TableCell>
            <TableCell align="right">
                {fields['word-count']}
            </TableCell>
            <TableCell align="right">
                {humanFileSize(fields.size)}
            </TableCell>
            <TableCell>
                <IconButton size="small" style={{ marginRight: 15 }}>
                    <a href={url} target="_blank" className={classes.buttonLink}>
                        {cloneElement(reactIcons.openNewTab, { className: classes.actionIcon })}
                    </a>
                </IconButton>
                <IconButton size="small">
                    <a href={downloadUrl} className={classes.buttonLink}>
                        {cloneElement(reactIcons.downloadOutlined, { className: classes.actionIcon })}
                    </a>
                </IconButton>
            </TableCell>
        </TableRow>
    )
}
