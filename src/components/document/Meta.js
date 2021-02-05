import React, { memo } from 'react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Divider, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { getLanguageName, humanFileSize, shortenName } from '../../utils'
import { createSearchUrl } from '../../queryUtils'
import {
    SEARCH_DATE_CREATED,
    SEARCH_FILENAME,
    SEARCH_MD5,
    SEARCH_DATE,
    SEARCH_PATH_PARTS,
    SEARCH_SHA1
} from '../../constants'

const useStyles = makeStyles(theme => ({
    raw: {
        fontFamily: 'monospace',
        fontSize: '12px',
    },
}))

const Meta = () => {
    const classes = useStyles()
    const { hashState } = useHashState()
    const { data, collection, digest, collectionBaseUrl, printMode } = useDocument()

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <>
            <List dense>
                <ListItem disableGutters>
                    <ListItemText
                        primary="Collection"
                        secondary={collection}
                    />
                </ListItem>

                <ListItem disableGutters>
                    <ListItemText
                        primary={printMode ? 'Filename' :
                            <Link href={createSearchUrl(data.content.filename, SEARCH_FILENAME, collection, hash)} shallow>
                                <a title="search this filename">Filename</a>
                            </Link>
                        }
                        secondary={data.content.filename}
                    />
                </ListItem>

                <ListItem disableGutters>
                    <ListItemText
                        primary={printMode ? 'Path' :
                            <Link href={createSearchUrl(data.content.path, SEARCH_PATH_PARTS, collection, hash)} shallow>
                                <a title="search this path">Path</a>
                            </Link>
                        }
                        secondary={data.content.path}
                    />
                </ListItem>

                {!!data.digest && (
                    <ListItem disableGutters>
                        <ListItemText primary="ID" secondary={
                            <Link href={`${collectionBaseUrl}/${data.digest}`} shallow>
                                <a>{data.digest}</a>
                            </Link>
                        } />
                    </ListItem>
                )}

                {!!data.content.filetype && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="Type"
                            secondary={data.content.filetype}
                        />
                    </ListItem>
                )}

                {data.content.filetype !== 'folder' && data.content.md5 && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary={printMode ? 'MD5' :
                                <Link href={createSearchUrl(data.content.md5, SEARCH_MD5, collection, hash)} shallow>
                                    <a title="search this MD5 checksum">MD5</a>
                                </Link>
                            }
                            secondary={data.content.md5}
                        />
                    </ListItem>
                )}

                {data.content.filetype !== 'folder' && data.content.sha1 && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary={printMode ? 'SHA1' :
                                <Link href={createSearchUrl(data.content.sha1, SEARCH_SHA1, collection, hash)} shallow>
                                    <a title="search this SHA1 checksum">SHA1</a>
                                </Link>
                            }
                            secondary={data.content.sha1}
                        />
                    </ListItem>
                )}

                {!!data.content.lang && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="Language"
                            secondary={getLanguageName(data.content.lang)}
                        />
                    </ListItem>
                )}

                {!!data.content.date && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary={printMode ? 'Modified' :
                                <Link href={createSearchUrl(data.content.date, SEARCH_DATE, collection, hash)} shallow>
                                    <a title="search modified this date">Modified</a>
                                </Link>
                            }
                            secondary={DateTime.fromISO(data.content.date, { locale: 'en-US' })
                                .toLocaleString(DateTime.DATETIME_FULL)}
                        />
                    </ListItem>
                )}

                {!!data.content['date-created'] && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary={printMode ? 'Created' :
                                <Link href={createSearchUrl(data.content['date-created'], SEARCH_DATE_CREATED, collection, hash)} shallow>
                                    <a title="search created this date">Created</a>
                                </Link>
                            }
                            secondary={DateTime.fromISO(data.content['date-created'], { locale: 'en-US' })
                                .toLocaleString(DateTime.DATETIME_FULL)}
                        />
                    </ListItem>
                )}

                {!!data.content.pgp && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="PGP"
                            secondary="true"
                        />
                    </ListItem>
                )}

                {!!data.content['word-count'] && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="Word count"
                            secondary={data.content['word-count']}
                        />
                    </ListItem>
                )}

                {!!data.content.size && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="Size"
                            secondary={humanFileSize(data.content.size, true)}
                        />
                    </ListItem>
                )}
            </List>
            <Divider />
            <Box>
                {Object.entries(data.content)
                    .filter(([key, value]) =>
                        !['text', 'ocrtext', 'path-text', 'path-parts'].includes(key) &&
                        ((!Array.isArray(value) && value) || (Array.isArray(value) && value.length))
                    )
                    .map(([key, value]) => (
                        <Typography key={key} component="pre" variant="caption" className={classes.raw}>
                            <strong>{key}:</strong>{' '}
                            {
                                typeof value === 'object' ?
                                shortenName(JSON.stringify(value), 200) :
                                typeof value === 'boolean' ? (value ? 'true' : 'false') :
                                shortenName(value, 200)
                            }
                        </Typography>
                    ))
                }
            </Box>
        </>
    )
}

export default memo(Meta)
