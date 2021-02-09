import React, { Fragment, memo, useCallback } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Typography
} from '@material-ui/core'
import { CallMade } from '@material-ui/icons'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { useSearch } from '../search/SearchProvider'
import { formatDateTime, getLanguageName, humanFileSize, shortenName } from '../../utils'
import { createSearchParams, createSearchUrl } from '../../queryUtils'

const useStyles = makeStyles(theme => ({
    icon: {
        transform: 'rotate(-90deg)',
    },
    raw: {
        fontFamily: 'monospace',
        fontSize: '12px',
    },
    rawIcon: {
        fontSize: '1rem',
        transform: 'rotate(-90deg)',
    }
}))

const tableFields = {
    filename: {
        label: 'Filename',
    },
    path: {
        label: 'Path',
        searchKey: 'path-parts',
    },
    filetype: {
        label: 'Type',
        visible: content => !!content.filetype,
    },
    md5: {
        label: 'MD5',
        tooltip: 'search this MD5 checksum',
        visible: content => content.filetype !== 'folder' && content.md5,
    },
    sha1: {
        label: 'SHA1',
        tooltip: 'search this SHA1 checksum',
        visible: content => content.filetype !== 'folder' && content.sha1,
    },
    lang: {
        label: 'Language',
        format: getLanguageName,
        visible: content => !!content.lang,
    },
    date: {
        label: 'Modified',
        format: formatDateTime,
        tooltip: 'search modified this date',
        visible: content => !!content.date,
    },
    'date-created': {
        label: 'Created',
        format: formatDateTime,
        tooltip: 'search created this date',
        visible: content => !!content['date-created'],
    },
    pgp: {
        label: 'PGP',
        format: () => 'true',
        searchTerm: () => 'true',
        tooltip: 'search encrypted',
        visible: content => !!content.pgp,
    },
    'word-count': {
        label: 'Word count',
        searchTerm: term => term.toString(),
        visible: content => !!content['word-count'],
    },
    size: {
        label: 'Size',
        format: humanFileSize,
        searchTerm: term => term.toString(),
        visible: content => !!content.size,
    }
}

const Meta = () => {
    const classes = useStyles()
    const { hashState } = useHashState()
    const { mergedSearch } = useSearch()
    const { data, collection, digest, collectionBaseUrl, printMode } = useDocument()

    const handleAddSearch = (field, term) => useCallback(() => {
        mergedSearch(createSearchParams(field, term))
    }, [mergedSearch])

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <>
            <List dense>
                <ListItem disableGutters>
                    <ListItemText
                        primary="Collection"
                        secondary={printMode ? collection :
                            <Link href={createSearchUrl('*', null, collection, hash)} shallow>
                                <a title="search this collection">{collection}</a>
                            </Link>
                        }
                    />
                </ListItem>

                {!!data.digest && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="ID"
                            secondary={
                                <Link href={`${collectionBaseUrl}/${data.digest}`} shallow>
                                    <a title="open digest URL">{data.digest}</a>
                                </Link>
                            }
                        />
                    </ListItem>
                )}

                {Object.entries(tableFields)
                    .filter(([,config]) => !config.visible || config.visible(data.content) !== false)
                    .map(([field, config]) => {

                    const display = config.format ? config.format(data.content[field]) : data.content[field]
                    const searchKey = config.searchKey || field
                    const searchTerm = config.searchTerm ? config.searchTerm(data.content[field]) : data.content[field]
                    const tooltip = config.tooltip || `search this ${config.label.toLowerCase()}`

                    return (
                        <ListItem key={field} disableGutters>
                            <ListItemText
                                primary={config.label}
                                secondary={printMode ? display :
                                    <Link href={createSearchUrl(searchTerm, searchKey, collection, hash)} shallow>
                                        <a title={tooltip}>{display}</a>
                                    </Link>
                                }
                            />
                            {mergedSearch && (
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={handleAddSearch(searchKey, searchTerm)}
                                    >
                                        <CallMade className={classes.icon} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            )}
                        </ListItem>
                    )
                })}
            </List>
            <Divider />
            <Box>
                {Object.entries(data.content)
                    .filter(([key, value]) =>
                        !['text', 'ocrtext', 'path-text', 'path-parts'].includes(key) &&
                        ((!Array.isArray(value) && value) || (Array.isArray(value) && value.length))
                    )
                    .map(([key, value]) => {
                        let description
                        if (typeof value === 'object') {
                            description = shortenName(JSON.stringify(value), 200)
                        } else if (typeof value === 'boolean') {
                            description = value ? 'true' : 'false'
                        } else {
                            description = shortenName(value, 200)
                        }

                        return (
                            <Typography key={key} component="pre" variant="caption" className={classes.raw}>
                                <strong>{key}:</strong>{' '}
                                {printMode ? description :
                                    Array.isArray(value) && value.length ?
                                        <>
                                            {'['}
                                                {value.map((element, index) =>
                                                    <Fragment key={index}>
                                                        <Link href={createSearchUrl(element.toString(), key, collection, hash)} shallow>
                                                            <a title="search this value">{element.toString()}</a>
                                                        </Link>
                                                        {mergedSearch && (
                                                            <IconButton size="small" onClick={handleAddSearch(key, element.toString())}>
                                                                <CallMade className={classes.rawIcon} />
                                                            </IconButton>
                                                        )}
                                                        {index < value.length - 1 && ','}
                                                    </Fragment>
                                                )}
                                            {']'}
                                        </> :
                                        <>
                                            <Link href={createSearchUrl(value.toString(), key, collection, hash)} shallow>
                                                <a title="search this value">{description}</a>
                                            </Link>
                                            {mergedSearch && (
                                                <IconButton size="small" onClick={handleAddSearch(key, value.toString())}>
                                                    <CallMade className={classes.rawIcon} />
                                                </IconButton>
                                            )}
                                        </>
                                }
                            </Typography>
                        )
                    })
                }
            </Box>
        </>
    )
}

export default memo(Meta)
