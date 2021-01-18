import React, { memo } from 'react'
import Link from 'next/link'
import url from 'url'
import { DateTime } from 'luxon'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { getLanguageName, humanFileSize } from '../../utils'
import { searchPath } from '../../queryUtils'
import {
    SEARCH_DATE_CREATED,
    SEARCH_FILENAME,
    SEARCH_MD5,
    SEARCH_DATE,
    SEARCH_PATH_PARTS,
    SEARCH_SHA1
} from '../../constants'

const Meta = ({ doc, collection, baseUrl, printMode }) => (
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
                    <Link href={searchPath(doc.content.filename, SEARCH_FILENAME, collection)} shallow>
                        <a title="search this filename">Filename</a>
                    </Link>
                }
                secondary={doc.content.filename}
            />
        </ListItem>

        <ListItem disableGutters>
            <ListItemText
                primary={printMode ? 'Path' :
                    <Link href={searchPath(doc.content.path, SEARCH_PATH_PARTS, collection)} shallow>
                        <a title="search this path">Path</a>
                    </Link>
                }
                secondary={doc.content.path}
            />
        </ListItem>

        {!!doc.digest &&
            <ListItem disableGutters>
                <ListItemText primary="ID" secondary={
                    <Link href={url.resolve(baseUrl,doc.digest)} shallow>
                        <a>{doc.digest}</a>
                    </Link>
                } />
            </ListItem>
        }

        {!!doc.content.filetype &&
            <ListItem disableGutters>
                <ListItemText
                    primary="Type"
                    secondary={doc.content.filetype}
                />
            </ListItem>
        }

        {doc.content.filetype !== 'folder' && doc.content.md5 &&
            <ListItem disableGutters>
                <ListItemText
                    primary={printMode ? 'MD5' :
                        <Link href={searchPath(doc.content.md5, SEARCH_MD5, collection)} shallow>
                            <a title="search this MD5 checksum">MD5</a>
                        </Link>
                    }
                    secondary={doc.content.md5}
                />
            </ListItem>
        }

        {doc.content.filetype !== 'folder' && doc.content.sha1 &&
            <ListItem disableGutters>
                <ListItemText
                    primary={printMode ? 'SHA1' :
                        <Link href={searchPath(doc.content.sha1, SEARCH_SHA1, collection)} shallow>
                            <a title="search this SHA1 checksum">SHA1</a>
                        </Link>
                    }
                    secondary={doc.content.sha1}
                />
            </ListItem>
        }

        {!!doc.content.lang &&
            <ListItem disableGutters>
                <ListItemText
                    primary="Language"
                    secondary={getLanguageName(doc.content.lang)}
                />
            </ListItem>
        }
        {!!doc.content.date &&
            <ListItem disableGutters>
                <ListItemText
                    primary={printMode ? 'Modified' :
                        <Link href={searchPath(doc.content.date, SEARCH_DATE, collection)} shallow>
                            <a title="search modified this date">Modified</a>
                        </Link>
                    }
                    secondary={DateTime.fromISO(doc.content.date, { locale: 'en-US' })
                        .toLocaleString(DateTime.DATETIME_FULL)}
                />
            </ListItem>
        }
        {!!doc.content['date-created'] &&
            <ListItem disableGutters>
                <ListItemText
                    primary={printMode ? 'Created' :
                        <Link href={searchPath(doc.content['date-created'], SEARCH_DATE_CREATED, collection)} shallow>
                            <a title="search created this date">Created</a>
                        </Link>
                    }
                    secondary={DateTime.fromISO(doc.content['date-created'], { locale: 'en-US' })
                            .toLocaleString(DateTime.DATETIME_FULL)}
                />
            </ListItem>
        }
        {!!doc.content.pgp &&
            <ListItem disableGutters>
                <ListItemText
                    primary="PGP"
                    secondary={doc.content.pgp}
                />
            </ListItem>
        }
        {!!doc.content['word-count'] &&
            <ListItem disableGutters>
                <ListItemText
                    primary="Word count"
                    secondary={doc.content['word-count']}
                />
            </ListItem>
        }
        {!!doc.content.size &&
            <ListItem disableGutters>
                <ListItemText
                    primary="Size"
                    secondary={humanFileSize(doc.content.size, true)}
                />
            </ListItem>
        }
    </List>
)

export default memo(Meta)
