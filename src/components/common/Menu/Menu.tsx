import { Button, IconButton, MenuItem, Menu as MenuMui, Typography, Divider, Box, MenuList } from '@mui/material'
import { observer } from 'mobx-react-lite'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { reactIcons } from '../../../constants/icons'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './Menu.styles'

interface Link {
    name: string
    url: string
    next?: boolean
    type?: 'admin' | 'logged-in' | 'not-logged-in'
}

export const Menu = observer(() => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { classes } = useStyles()
    const router = useRouter()
    const { user } = useSharedStore()

    const { query } = router
    const printMode = query.print && query.print !== 'false'

    if (printMode) {
        return null
    }

    const links: Link[] = ([
        {
            name: 'Search',
            url: '/',
            next: true,
        },
        {
            name: 'Batch',
            url: '/batch-search',
            next: true,
        },
        {
            name: 'Insights',
            url: '/insights',
            next: true,
        },
        process.env.HOOVER_UPLOADS_ENABLED
            ? {
                  name: 'Uploads',
                  url: '/uploads',
                  next: true,
              }
            : false,
        process.env.HOOVER_MAPS_ENABLED
            ? {
                  name: 'Maps',
                  url: '/maps',
                  next: true,
              }
            : false,
        process.env.HOOVER_TRANSLATION_ENABLED
            ? {
                  name: 'Translate',
                  url: '/libre_translate',
              }
            : false,
        {
            name: 'Docs',
            url: 'https://github.com/liquidinvestigations/docs/wiki/User-Guide:-Hoover',
        },
    ].filter(Boolean) as Link[]).map((link: Link) => ({ ...link, active: router.asPath === link.url }))

    const userMenuLinks: Link[] = [
        {
            name: 'Login',
            url: user.urls.login,
            type: 'not-logged-in',
        },
        {
            name: 'Admin',
            url: user.urls.admin,
            type: 'admin',
        },
        {
            name: `Logout`,
            url: user.urls.logout,
            type: 'logged-in',
        },
    ]

    const shouldShow = (link: Link) => {
        if (link.type === 'admin') {
            return user.admin
        }
        if (link.type === 'logged-in') {
            return user.username
        }
        if (link.type === 'not-logged-in') {
            return !user.username
        }
        return true
    }

    const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleUserMenuClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            {links.map((link) =>
                !link.next ? (
                    <Button key={link.name} variant="text" href={link.url} color="inherit">
                        {link.name}
                    </Button>
                ) : (
                    <NextLink key={link.name} href={link.url} shallow className={classes.link}>
                        <Button variant="text" href={link.url} color="inherit" component="span">
                            {link.name}
                        </Button>
                    </NextLink>
                )
            )}
            <IconButton edge="end" color="inherit" onClick={handleUserMenuClick}>
                {reactIcons.accountCircle}
            </IconButton>
            <MenuMui anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
                <Box className={classes.menuHeader}>
                    <Typography variant="subtitle1">{user.username}</Typography>
                </Box>
                <Divider />
                <MenuList>
                    {userMenuLinks.filter(shouldShow).map((link) => (
                        <MenuItem key={link.name}>
                            <NextLink href={link.url} shallow className={classes.menuItem}>
                                {link.name}
                            </NextLink>
                        </MenuItem>
                    ))}
                </MenuList>
            </MenuMui>
        </>
    )
})
