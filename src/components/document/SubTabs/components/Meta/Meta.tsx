import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { useState, MouseEvent } from 'react'

import { DocumentContent, SourceField } from '../../../../../Types'
import { flatten, formatDateTime, getLanguageName, humanFileSize, shortenName } from '../../../../../utils/utils'
import { useSharedStore } from '../../../../SharedStoreProvider'
import LinkMenu from '../../../LinkMenu'

import { useStyles } from './Meta.styles'

const tableFields: Partial<
    Record<
        SourceField,
        {
            label: string
            searchKey?: SourceField
            visible?: (content?: Partial<DocumentContent>) => boolean
            format?: (term?: any) => string
            searchTerm?: (term: any) => string
        }
    >
> = {
    filename: {
        label: 'Filename',
    },
    path: {
        label: 'Path',
        searchKey: 'path-parts',
    },
    filetype: {
        label: 'Type',
        visible: (content) => !!content?.filetype,
    },
    md5: {
        label: 'MD5',
        visible: (content) => content?.filetype !== 'folder' && !!content?.md5,
    },
    sha1: {
        label: 'SHA1',
        visible: (content) => content?.filetype !== 'folder' && !!content?.sha1,
    },
    lang: {
        label: 'Language',
        format: getLanguageName,
        visible: (content) => !!content?.lang,
    },
    date: {
        label: 'Modified',
        format: formatDateTime,
        visible: (content) => !!content?.date,
    },
    'date-created': {
        label: 'Created',
        format: formatDateTime,
        visible: (content) => !!content?.['date-created'],
    },
    pgp: {
        label: 'PGP',
        format: () => 'true',
        searchTerm: () => 'true',
        visible: (content) => !!content?.pgp,
    },
    'word-count': {
        label: 'Word count',
        searchTerm: (term) => term.toString(),
        visible: (content) => !!content?.['word-count'],
    },
    size: {
        label: 'Size',
        format: humanFileSize,
        searchTerm: (term) => term.toString(),
        visible: (content) => !!content?.size,
    },
}

export const Meta = observer(() => {
    const { classes } = useStyles()
    const { data, collection, collectionBaseUrl } = useSharedStore().documentStore

    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | undefined>()
    const [currentLink, setCurrentLink] = useState<{ field: string; term: string | string[] } | undefined>()

    const handleLinkClick = (field: string, term: any) => (event: MouseEvent) => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(undefined)
    }

    const getFieldSearchKey = (key: string) => {
        switch (key) {
            case 'detected-objects':
                return `${key}.object.keyword`
            case 'image-classes':
                return `${key}.class.keyword`
            default:
                return key
        }
    }

    const getFieldValue = (key: string, value: any) => {
        switch (key) {
            case 'detected-objects':
                return value['object']
            case 'image-classes':
                return value['class']
            default:
                return value.toString()
        }
    }

    const getFieldScore = (key: string, value: any) => {
        switch (key) {
            case 'detected-objects':
            case 'image-classes':
                return <span className={classes.score}>({value.score})</span>
            default:
                return null
        }
    }

    const renderElement = (key: string, value: any, componentKey: string) => (
        <Typography key={componentKey} component="pre" variant="caption" className={classes.raw}>
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

                {!!data?.digest && (
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
                    .filter(([, config]) => !config.visible || config.visible(data?.content) !== false)
                    .map(([field, config]) => {
                        const display = config.format
                            ? config.format(data?.content?.[field as keyof DocumentContent])
                            : (data?.content[field as keyof DocumentContent] as string)
                        const searchKey = config.searchKey || field
                        const searchTerm = config.searchTerm
                            ? config.searchTerm(data?.content?.[field as keyof DocumentContent])
                            : data?.content[field as keyof DocumentContent]

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
                {data &&
                    Object.entries(data.content)
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
                                Array.isArray(value)
                                    ? value.map((v, i) => renderElement(key, v, `${index}-${i}`))
                                    : renderElement(key, value, index.toString())
                            )
                        })}
            </Box>

            <LinkMenu link={currentLink} anchorPosition={menuPosition} onClose={handleLinkMenuClose} />
        </>
    )
})
