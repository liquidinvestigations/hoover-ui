import url from 'url'

import { Box, List, ListItem, ListItemIcon, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { memo } from 'react'

import { reactIcons } from '../../../constants/icons'
import { Loading } from '../../common/Loading/Loading'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './Locations.styles'

export const Locations = observer(() => {
    const { classes } = useStyles()
    const {
        fullPage,
        documentStore: {
            digestUrl: docUrl,
            data,
            locationsStore: { error, locations, hasNextPage, loadingNextPage, loadMore },
        },
    } = useSharedStore()

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
})

export default memo(Locations)
