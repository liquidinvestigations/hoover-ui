import { Button, IconButton, MenuItem, Menu as MenuMui, Typography, Divider, Box, MenuList } from '@mui/material'
import { T, useTolgee, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { NestedMenuItem } from 'mui-nested-menu'
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
    active?: boolean
}

export const Menu = observer(() => {
    const { t } = useTranslate()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { classes } = useStyles()
    const router = useRouter()
    const { user } = useSharedStore()
    const tolgee = useTolgee(['language'])

    const { query } = router
    const printMode = query.print && query.print !== 'false'

    if (printMode) {
        return null
    }

    const getNavLinks = (): Link[] => {
        const links: Link[] = [
            {
                name: t('search', 'Search'),
                url: '/',
                next: true,
                active: router.asPath === '/',
            },
            {
                name: t('batch', 'Batch'),
                url: '/batch-search',
                next: true,
                active: router.asPath === '/batch-search',
            },
            {
                name: t('insights', 'Insights'),
                url: '/insights',
                next: true,
                active: router.asPath === '/insights',
            },
        ]

        if (process.env.HOOVER_UPLOADS_ENABLED) {
            links.push({
                name: t('uploads', 'Uploads'),
                url: '/uploads',
                next: true,
                active: router.asPath === '/uploads',
            })
        }

        if (process.env.HOOVER_MAPS_ENABLED) {
            links.push({
                name: t('maps', 'Maps'),
                url: '/maps',
                next: true,
                active: router.asPath === '/maps',
            })
        }

        if (process.env.HOOVER_TRANSLATION_ENABLED) {
            links.push({
                name: t('translate', 'Translate'),
                url: '/libre_translate',
                active: router.asPath === '/libre_translate',
            })
        }

        links.push({
            name: t('docs', 'Docs'),
            url: 'https://github.com/liquidinvestigations/docs/wiki/User-Guide:-Hoover',
        })

        if (user?.admin) {
            links.push({
                name: t('admin', 'Admin'),
                url: user.urls.admin,
                active: router.asPath === user.urls.admin,
            })
        }

        return links
    }

    const getMenuLinks = (): Link[] => {
        const links: Link[] = []

        if (user?.username) {
            links.push({
                name: t('logout', 'Logout'),
                url: user.urls.logout,
            })
        }

        if (user && !user.username) {
            links.push({
                name: t('login', 'Login'),
                url: user.urls.login,
            })
        }

        return links
    }

    const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleUserMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLanguageChange = (lang: string) => () => {
        localStorage.setItem('language', lang)
        tolgee.changeLanguage(lang)
    }

    return (
        <>
            {getNavLinks().map((link) =>
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
                ),
            )}
            <IconButton edge="end" color="inherit" onClick={handleUserMenuClick}>
                {reactIcons.accountCircle}
            </IconButton>
            <MenuMui anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
                {!!user?.username && (
                    <Box>
                        <Typography variant="subtitle1" className={classes.menuHeader}>
                            {user.username}
                        </Typography>
                        <Divider />
                    </Box>
                )}
                <MenuList>
                    <NestedMenuItem label={t('language', 'Language')} parentMenuOpen={Boolean(anchorEl)} className={classes.languageMenu}>
                        <MenuItem onClick={handleLanguageChange('en')} selected={tolgee.getLanguage() === 'en'}>
                            🇺🇸 <T keyName="english">English</T>
                        </MenuItem>
                        <MenuItem onClick={handleLanguageChange('pl')} selected={tolgee.getLanguage() === 'pl'}>
                            🇵🇱 <T keyName="polish">Polish</T>
                        </MenuItem>
                    </NestedMenuItem>
                    {getMenuLinks().map((link) => (
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
