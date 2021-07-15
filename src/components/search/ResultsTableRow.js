import React, { cloneElement, useEffect, useRef } from 'react'
import cn from 'classnames'
import { IconButton, TableCell, TableRow, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSearch } from './SearchProvider'
import { useHashState } from '../HashStateProvider'
import { createDownloadUrl } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import {
    documentViewUrl,
    formatDateTime,
    getPreviewParams,
    getTypeIcon,
    humanFileSize,
    truncatePath
} from '../../utils'

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
    const { query, resultsColumns } = useSearch()
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

    const getPath = path => {
        let pathParts = path.split('.'), pathPart, result = hit
        while (pathPart = pathParts.shift()) {
            result = result[pathPart]
        }
        return result
    }

    const formatField = (path, format) => {
        const field = getPath(path)

        if (!field) {
            return null
        }

        switch (format) {
            case 'string':
                return field
            case 'boolean':
                return field ? 'yes' : 'no'
            case 'truncate':
                return truncatePath(fields.path)
            case 'date':
                return formatDateTime(field)
            case 'size':
                return humanFileSize(field)
            case 'icon':
                return (
                    <Tooltip placement="top" title={field}>
                        <span>
                            {cloneElement(reactIcons[getTypeIcon(field)], { className: classes.infoIcon })}
                        </span>
                    </Tooltip>
                )
            case 'array':
                return field.map(el => (
                    <>
                        {el}
                        <br />
                    </>
                ))
        }
    }

    return (
        <TableRow
            ref={nodeRef}
            onClick={handleResultClick}
            className={cn({ [classes.selected]: isPreview })}
        >
            <TableCell>
                {start + index}
            </TableCell>
            {resultsColumns.map(([field, { align, path, format }]) => (
                    <TableCell key={field} align={align}>
                        {formatField(path, format)}
                    </TableCell>
            ))}
            <TableCell>
                <Tooltip title="Open in new tab">
                    <IconButton size="small" style={{ marginRight: 15 }}>
                        <a href={url} target="_blank" className={classes.buttonLink}>
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
}
