import React, { memo } from 'react'
import Link from 'next/link'
import url from 'url'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { getLanguageName, isPrintMode, searchPath } from '../../utils'
import Section from './Section'
import {
    SEARCH_CREATION_DATE,
    SEARCH_FILENAME,
    SEARCH_MD5,
    SEARCH_MODIFICATION_DATE,
    SEARCH_PATH_PARTS,
    SEARCH_SHA1
} from '../../constants'

function MetaSection({ doc, collection, baseUrl }) {
    const printMode = isPrintMode()

    const data = doc ? doc.content : null;

    return (
        <Section title="Meta">
            {data &&
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
                                <Link href={searchPath(data.filename, SEARCH_FILENAME, collection)} shallow>
                                    <a title="search this filename">Filename</a>
                                </Link>
                            }
                            secondary={data.filename}
                        />
                    </ListItem>

                    <ListItem disableGutters>
                        <ListItemText
                            primary={printMode ? 'Path' :
                                <Link href={searchPath(data.path, SEARCH_PATH_PARTS, collection)} shallow>
                                    <a title="search this path">Path</a>
                                </Link>
                            }
                            secondary={data.path}
                        />
                    </ListItem>

                    {doc.digest &&
                        <ListItem disableGutters>
                            <ListItemText primary="Id" secondary={
                                <Link href={url.resolve(baseUrl,doc.digest)} shallow>
                                    <a>{doc.digest}</a>
                                </Link>
                            } />
                        </ListItem>
                    }

                    {data.filetype &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Type"
                                secondary={data.filetype}
                            />
                        </ListItem>
                    }

                    {data.filetype !== 'folder' && data.md5 &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary={printMode ? 'MD5' :
                                    <Link href={searchPath(data.md5, SEARCH_MD5, collection)} shallow>
                                        <a title="search this MD5 checksum">MD5</a>
                                    </Link>
                                }
                                secondary={data.md5}
                            />
                        </ListItem>
                    }

                    {data.filetype !== 'folder' && data.sha1 &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary={printMode ? 'SHA1' :
                                    <Link href={searchPath(data.sha1, SEARCH_SHA1, collection)} shallow>
                                        <a title="search this SHA1 checksum">SHA1</a>
                                    </Link>
                                }
                                secondary={data.sha1}
                            />
                        </ListItem>
                    }

                    {data.lang &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Language"
                                secondary={getLanguageName(data.lang)}
                            />
                        </ListItem>
                    }
                    {data.date &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary={printMode ? 'Modified' :
                                    <Link href={searchPath(data.date, SEARCH_MODIFICATION_DATE, collection)} shallow>
                                        <a title="search modified this date">Modified</a>
                                    </Link>
                                }
                                secondary={data.date}
                            />
                        </ListItem>
                    }
                    {data['date-created'] &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary={printMode ? 'Created' :
                                    <Link href={searchPath(data['date-created'], SEARCH_CREATION_DATE, collection)} shallow>
                                        <a title="search created this date">Created</a>
                                    </Link>
                                }
                                secondary={data['date-created']}
                            />
                        </ListItem>
                    }
                    {data.pgp &&
                        <ListItem disableGutters>
                            <ListItemText
                                primary="PGP"
                                secondary={data.pgp}
                            />
                        </ListItem>
                    }
                </List>
            }
        </Section>
    )
}

export default memo(MetaSection)
