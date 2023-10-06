import url from 'url'

import { List, ListItem, ListItemIcon, Typography, Box } from '@mui/material'
import { T } from '@tolgee/react'
import Link from 'next/link'
import { FC, memo, SyntheticEvent, useEffect, useState } from 'react'

import { locations as locationsAPI } from '../../../backend/api'
import { reactIcons } from '../../../constants/icons'
import { DocumentData, LocationData } from '../../../Types'
import { Loading } from '../../common/Loading/Loading'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './Locations.styles'

interface Error {
    status: string
    statusText: string
    url: string
}

interface LocationsProps {
    url?: string
    data?: DocumentData
}

export const Locations: FC<LocationsProps> = ({ url: docUrl, data }) => {
    const { classes } = useStyles()
    const { fullPage } = useSharedStore()
    const [locations, setLocations] = useState<LocationData[]>([])
    const [error, setError] = useState<Error | null>(null)
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

    const loadMore = async (event: SyntheticEvent) => {
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
                <T keyName="request_to_url_error" params={{ url: error.url, status: error.status, statusText: error.statusText }}>
                    {'Request to {url} returned HTTP {status} {statusText}'}
                </T>
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
        <Box className={classes.container} sx={{ height: fullPage ? '100%' : '40%' }}>
            <Typography variant="h6" className={classes.title}>
                <T keyName="locations">Locations</T>
            </Typography>
            <List component="nav" dense className={classes.list}>
                {locations.length && (
                    <>
                        {locations.map((location) => (
                            <Link key={location.id} href={`${basePath}${location.id}`} shallow {...(!fullPage && { target: '_blank' })}>
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
                                <T keyName="load_more">load more...</T>
                            </a>
                        )}
                    </ListItem>
                )}
            </List>
        </Box>
    )
}

export default memo(Locations)
