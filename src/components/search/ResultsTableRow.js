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
    getTagIcon,
    getTypeIcon,
    humanFileSize,
    shortenName,
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
    tagIcon: {
        fontSize: 16,
        verticalAlign: 'middle',
        marginRight: theme.spacing(0.5),
    }
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

    const getValue = path => {
        let pathParts = path.split('.'), pathPart, value = hit
        while (pathPart = pathParts.shift()) {
            value = value[pathPart]
        }
        return value
    }

    const formatField = (field, path, format) => {
        const value = getValue(path)

        switch (format) {
            case 'string':
                return value ? shortenName(value, 60) : null
            case 'boolean':
                return value ? 'yes' : 'no'
            case 'date':
                return value ? formatDateTime(value) : null
            case 'size':
                return value ? humanFileSize(value) : null
            case 'icon':
                return (
                    <Tooltip placement="top" title={value ? value : 'unknown'}>
                        <span>
                            {cloneElement(getTypeIcon(value), { className: classes.infoIcon })}
                        </span>
                    </Tooltip>
                )
            case 'array':
                return !value ? null : (
                    <>
                        {value.slice(0, 7).map(el => (
                            <>
                                {shortenName(el)}
                                <br />
                            </>
                        ))}
                        {value.length > 7 && '...'}
                    </>
                )
            case 'tags':
                const icon = tag => getTagIcon(tag, field === 'tags')
                return !value ? null : (
                    <>
                        {value.slice(0, 7).map(el => (
                            <>
                                {icon(el) && cloneElement(icon(el), { className: classes.tagIcon })}
                                {shortenName(el)}
                                <br />
                            </>
                        ))}
                        {value.length > 7 && '...'}
                    </>
                )
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
                        {formatField(field, path, format)}
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
