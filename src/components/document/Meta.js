import React, { memo, useState } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@material-ui/core'
import LinkMenu from './LinkMenu'
import { useDocument } from './DocumentProvider'
import { formatDateTime, getLanguageName, humanFileSize, shortenName } from '../../utils'

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
    },
    searchField: {
        cursor: 'pointer',
        borderBottom: '1px dotted ' + theme.palette.grey[400],
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
        visible: content => content.filetype !== 'folder' && content.md5,
    },
    sha1: {
        label: 'SHA1',
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
        visible: content => !!content.date,
    },
    'date-created': {
        label: 'Created',
        format: formatDateTime,
        visible: content => !!content['date-created'],
    },
    pgp: {
        label: 'PGP',
        format: () => 'true',
        searchTerm: () => 'true',
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
    },
}

const Meta = () => {
    const classes = useStyles()
    const { data, collection, collectionBaseUrl } = useDocument()

    const [menuPosition, setMenuPosition] = useState(null)
    const [currentLink, setCurrentLink] = useState(null)

    const handleLinkClick = (field, term) => event => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(null)
    }

    return (
        <>
            <List dense>
                <ListItem disableGutters>
                    <ListItemText
                        primary="Collection"
                        secondary={collection}
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

                    return (
                        <ListItem key={field} disableGutters>
                            <ListItemText
                                primary={config.label}
                                secondary={
                                    <>
                                        <span
                                            className={classes.searchField}
                                            onClick={handleLinkClick(searchKey, searchTerm)}
                                        >
                                            {display}
                                        </span>
                                    </>
                                }
                            />
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
                            Array.isArray(value) && value.length ?
                                value.map((element, index) =>
                                    <Typography key={index} component="pre" variant="caption" className={classes.raw}>
                                        <strong>{key}:</strong>{' '}
                                        <span
                                            className={classes.searchField}
                                            onClick={handleLinkClick(key, element.toString())}
                                        >
                                            {element.toString()}
                                        </span>
                                    </Typography>
                                ) :
                                <Typography key={key} component="pre" variant="caption" className={classes.raw}>
                                    <strong>{key}:</strong>{' '}
                                    <span
                                        className={classes.searchField}
                                        onClick={handleLinkClick(key, value.toString())}
                                    >
                                        {description}
                                    </span>
                                </Typography>
                        )
                    })
                }
            </Box>
            <LinkMenu
                link={currentLink}
                anchorPosition={menuPosition}
                onClose={handleLinkMenuClose}
            />
        </>
    )
}

export default memo(Meta)
