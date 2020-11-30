import React, { memo, useEffect, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { List, ListItem, ListItemIcon, Typography } from '@material-ui/core'
import { Folder } from '@material-ui/icons'
import Loading from './Loading'
import api from '../api'

function Locations({ url: docUrl, data }) {
    const [locations, setLocations] = useState([])
    const [page, setPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [loadingNextPage, setLoadingNextPage] = useState(false)

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
        setLoadingNextPage(true)
        const response = await api.locationsFor(docUrl, page + 1)
        setPage(page + 1)
        setLocations([...locations, ...response.locations])
        setHasNextPage(response.has_next_page)
        setLoadingNextPage(false)
    }

    if (!docUrl || !data) {
        return null
    }

    if (!locations.length && data.has_locations) {
        return <Loading />
    }

    const baseUrl = url.resolve(docUrl, './').replace(/\/+/g, '/')
    const basePath = url.parse(baseUrl).pathname

    return (
        <List component="nav" dense>
            <ListItem dense>
                <Typography variant="h6">Locations</Typography>
            </ListItem>

            {locations.length && (
                <>
                    {locations.map(location => (
                        <Link key={location.id} href={`${basePath}${location.id}`} shallow>
                            <a>
                                <ListItem button>
                                    <ListItemIcon>
                                        <Folder />
                                    </ListItemIcon>

                                    <Typography style={{ wordBreak: 'break-all' }}>
                                        {location.parent_path}/<em>{location.filename}</em>
                                    </Typography>
                                </ListItem>
                            </a>
                        </Link>
                    ))}
                </>
            )}
            {hasNextPage && <ListItem dense>
                {loadingNextPage ? <Loading /> : <a href="#" onClick={loadMore}>load more...</a>}
            </ListItem>}
        </List>
    )
}

export default memo(Locations)
