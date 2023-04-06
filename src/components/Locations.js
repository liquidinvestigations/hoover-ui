import url from 'url'

import { List, ListItem, ListItemIcon, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'

import { locations as locationsAPI } from '../backend/api'
import { reactIcons } from '../constants/icons'

import { Loading } from './common/Loading/Loading'

const useStyles = makeStyles((theme) => ({
    error: {
        padding: theme.spacing(3),
        fontSize: '14px',

        '& a': {
            color: theme.palette.error.main,
        },
    },
}))

function Locations({ url: docUrl, data }) {
    const classes = useStyles()
    const [locations, setLocations] = useState([])
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [loadingNextPage, setLoadingNextPage] = useState(false)

    useEffect(() => {
        if (docUrl) {
            setError(null)
            locationsAPI(docUrl, page)
                .then((response) => {
                    setLocations(response.locations)
                    setHasNextPage(response.has_next_page)
                })
                .catch((res) => {
                    setError({ status: res.status, statusText: res.statusText, url: res.url })
                })
        }
    }, [docUrl, page])

    const loadMore = async (event) => {
        event.preventDefault()
        setLoadingNextPage(true)
        const response = await locationsAPI(docUrl, page + 1)
        setPage(page + 1)
        setLocations([...locations, ...response.locations])
        setHasNextPage(response.has_next_page)
        setLoadingNextPage(false)
    }

    if (error) {
        return (
            <Typography color="error" className={classes.error}>
                Error: Request to <a href={error.url}>{error.url}</a> returned HTTP {error.status} {error.statusText}
            </Typography>
        )
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
            <ListItem>
                <Typography variant="h6">Locations</Typography>
            </ListItem>

            {locations.length && (
                <>
                    {locations.map((location) => (
                        <Link key={location.id} href={`${basePath}${location.id}`} shallow>
                            <ListItem button>
                                <ListItemIcon>{reactIcons.location}</ListItemIcon>

                                <Typography style={{ wordBreak: 'break-all' }}>
                                    {location.parent_path}/<em>{location.filename}</em>
                                </Typography>
                            </ListItem>
                        </Link>
                    ))}
                </>
            )}
            {hasNextPage && (
                <ListItem dense>
                    {loadingNextPage ? (
                        <Loading />
                    ) : (
                        <a href="#" onClick={loadMore}>
                            load more...
                        </a>
                    )}
                </ListItem>
            )}
        </List>
    )
}

export default memo(Locations)
