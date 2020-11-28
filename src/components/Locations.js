import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { List, ListItem, ListItemIcon, Typography } from '@material-ui/core'
import { Folder } from '@material-ui/icons'
import Loading from './Loading'
import api from '../api'

export default function Locations({ url: docUrl, data }) {
    const [locations, setLocations] = useState([])
    const [page, setPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [isFetchingLocationsPage, setFetchingLocationsPage] = useState(false)

    useEffect(() => {
        if (docUrl) {
            api.locationsFor(docUrl, page).then(response => {
                setLocations(response.locations)
                setHasNextPage(response.has_next_page)
            })
        }
    }, [docUrl])

    const loadMore = async event => {
        event.preventDefault()
        setFetchingLocationsPage(true)
        const response = await api.locationsFor(docUrl, page + 1)
        setPage(page + 1)
        setLocations([...locations, ...response.locations])
        setHasNextPage(response.has_next_page)
        setFetchingLocationsPage(false)
    }

    if (!locations.length && data.has_locations) {
        return <Loading />;
    } else if (!locations.length) {
        return null;
    }

    const baseUrl = url.resolve(docUrl, './');
    const basePath = url.parse(baseUrl).pathname;

    return (
        <List component="nav" dense>
            <ListItem dense>
                <Typography variant="h6">Locations</Typography>
            </ListItem>

            {locations.length && (
                <>
                    {locations.map(loc => (
                        <Link key={loc.id} href={`${basePath}${loc.id}`}>
                            <a>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Folder />
                                    </ListItemIcon>

                                    <Typography classes={{}}>
                                        {loc.parent_path}/<em>{loc.filename}</em>
                                    </Typography>
                                </ListItem>
                            </a>
                        </Link>
                    ))}
                </>
            )}
            {hasNextPage && <ListItem dense>
                {isFetchingLocationsPage ? <Loading /> : <a href="#" onClick={loadMore}>load more...</a>}
            </ListItem>}
        </List>
    )
}
