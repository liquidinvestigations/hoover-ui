import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { useState } from 'react'

import { flatten, formatDateTime, getLanguageName, humanFileSize, shortenName } from '../../utils/utils'
import { useSharedStore } from '../SharedStoreProvider'

import LinkMenu from './LinkMenu'

const useStyles = makeStyles((theme) => ({
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
    },
    score: {
        color: theme.palette.grey[500],
    },
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
        visible: (content) => !!content.filetype,
    },
    md5: {
        label: 'MD5',
        visible: (content) => content.filetype !== 'folder' && content.md5,
    },
    sha1: {
        label: 'SHA1',
        visible: (content) => content.filetype !== 'folder' && content.sha1,
    },
    lang: {
        label: 'Language',
        format: getLanguageName,
        visible: (content) => !!content.lang,
    },
    date: {
        label: 'Modified',
        format: formatDateTime,
        visible: (content) => !!content.date,
    },
    'date-created': {
        label: 'Created',
        format: formatDateTime,
        visible: (content) => !!content['date-created'],
    },
    pgp: {
        label: 'PGP',
        format: () => 'true',
        searchTerm: () => 'true',
        visible: (content) => !!content.pgp,
    },
    'word-count': {
        label: 'Word count',
        searchTerm: (term) => term.toString(),
        visible: (content) => !!content['word-count'],
    },
    size: {
        label: 'Size',
        format: humanFileSize,
        searchTerm: (term) => term.toString(),
        visible: (content) => !!content.size,
    },
}

export const Meta = observer(() => {
    const classes = useStyles()
    const { data, collection, collectionBaseUrl } = useSharedStore().documentStore

    const [menuPosition, setMenuPosition] = useState(null)
    const [currentLink, setCurrentLink] = useState(null)

    const handleLinkClick = (field, term) => (event) => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(null)
    }

    const getFieldSearchKey = (key) => {
        switch (key) {
            case 'detected-objects':
                return `${key}.object.keyword`
            case 'image-classes':
                return `${key}.class.keyword`
            default:
                return key
        }
    }

    const getFieldValue = (key, value) => {
        switch (key) {
            case 'detected-objects':
                return value['object']
            case 'image-classes':
                return value['class']
            default:
                return value.toString()
        }
    }

    const getFieldScore = (key, value) => {
        switch (key) {
            case 'detected-objects':
            case 'image-classes':
                return <span className={classes.score}>({value.score})</span>
            default:
                return null
        }
    }

    const renderElement = (key, value, index) => (
        <Typography key={index} component="pre" variant="caption" className={classes.raw}>
            <strong>{key}:</strong>{' '}
            <span className={classes.searchField} onClick={handleLinkClick(getFieldSearchKey(key), getFieldValue(key, value))}>
                {shortenName(getFieldValue(key, value), 200)}
                {getFieldScore(key, value)}
            </span>
        </Typography>
    )

    return (
        <>
            <List dense>
                <ListItem disableGutters>
                    <ListItemText primary="Collection" secondary={collection} />
                </ListItem>

                {!!data.digest && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="ID"
                            secondary={
                                <Link href={`${collectionBaseUrl}/${data.digest}`} title="open digest URL" shallow>
                                    {data.digest}
                                </Link>
                            }
                        />
                    </ListItem>
                )}

                {Object.entries(tableFields)
                    .filter(([, config]) => !config.visible || config.visible(data.content) !== false)
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
                                            <span className={classes.searchField} onClick={handleLinkClick(searchKey, searchTerm)}>
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
                    .filter(
                        ([key, value]) =>
                            !['text', 'ocrtext', 'path-text', 'path-parts'].includes(key) &&
                            ((!Array.isArray(value) && value) || (Array.isArray(value) && value.length))
                    )
                    .map(([key, value]) => {
                        let elements
                        if (Array.isArray(value)) {
                            elements = { [key]: value }
                        } else if (typeof value === 'object') {
                            elements = flatten(value, [key])
                        } else if (typeof value === 'boolean') {
                            elements = { [key]: value ? 'true' : 'false' }
                        } else {
                            elements = { [key]: value }
                        }

                        return Object.entries(elements).map(([key, value], index) =>
                            Array.isArray(value) ? value.map((v, i) => renderElement(key, v, `${index}-${i}`)) : renderElement(key, value, index)
                        )
                    })}
            </Box>

            <LinkMenu link={currentLink} anchorPosition={menuPosition} onClose={handleLinkMenuClose} />
        </>
    )
})
