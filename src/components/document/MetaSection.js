import React from 'react'
import Link from 'next/link'
import path from 'path'
import url from 'url'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { getLanguageName } from '../../utils'
import Section from './Section'

export default function MetaSection({ doc, collection, baseUrl }) {
    const data = doc ? doc.content : null;

    return (
        <Section title="Meta">
            {data && (
                <List dense>
                    <ListItem disableGutters>
                        <ListItemText
                            primary="Collection"
                            secondary={collection}
                        />
                    </ListItem>

                    <ListItem disableGutters>
                        <ListItemText
                            primary="Filename"
                            secondary={data.filename}
                        />
                    </ListItem>

                    <ListItem disableGutters>
                        <ListItemText primary="Path" secondary={path.normalize(data.path)} />
                    </ListItem>

                    {doc.digest && (
                        <ListItem disableGutters>
                            <ListItemText primary="Id" secondary={
                                <Link href={url.resolve(baseUrl,doc.digest)}>
                                    <a>{doc.digest}</a>
                                </Link>
                            } />
                        </ListItem>
                    )}

                    {data.filetype && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Type"
                                secondary={data.filetype}
                            />
                        </ListItem>
                    )}

                    {data.filetype !== 'folder' && data.md5 && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="MD5"
                                secondary={data.md5}
                            />
                        </ListItem>
                    )}

                    {data.filetype !== 'folder' && data.sha1 && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="SHA1"
                                secondary={data.sha1}
                            />
                        </ListItem>
                    )}

                    {data.lang && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Language"
                                secondary={getLanguageName(data.lang)}
                            />
                        </ListItem>
                    )}
                    {data.date && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Modified"
                                secondary={data['date']}
                            />
                        </ListItem>
                    )}
                    {data['date-created'] && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="Created"
                                secondary={data['date-created']}
                            />
                        </ListItem>
                    )}
                    {data.pgp && (
                        <ListItem disableGutters>
                            <ListItemText
                                primary="PGP"
                                secondary={data.pgp}
                            />
                        </ListItem>
                    )}
                </List>
            )}
        </Section>
    )
}
