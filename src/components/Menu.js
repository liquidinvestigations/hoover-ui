import React, { memo } from 'react'
import Link from 'next/link'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import { useSharedStore } from "./SharedStoreProvider"

function Menu() {
    const router = useRouter()
    const user = useSharedStore().user

    const { query } = router
    const printMode = query.print && query.print !== 'false'

    if (printMode) {
        return null
    }

    const links = () => ([
        {
            name: 'Search',
            url: '/',
            next: true,
        },
        {
            name: 'Batch search',
            url: '/batch-search',
            next: true,
        },
        {
            name: 'Insights',
            url: '/insights',
            next: true,
        },
        process.env.HOOVER_UPLOADS_ENABLED ? {
            name: 'Uploads',
            url: '/uploads',
            next: true,
        } : false,
        process.env.HOOVER_MAPS_ENABLED ? {
            name: 'Maps',
            url: '/maps',
            next: true,
        } : false,
        process.env.HOOVER_TRANSLATION_ENABLED ? {
            name: 'Translate',
            url: '/libre_translate',
        } : false,
        {
            name: 'About',
            url: 'https://github.com/liquidinvestigations/hoover-search',
        },
        //{
        //    name: 'Terms',
        //    url: '/terms',
        //    next: true,
        //},
        {
            name: 'Documentation',
            url: 'https://github.com/liquidinvestigations/docs/wiki/User-Guide:-Hoover',
        },
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
            name: `Logout (${user.username})`,
            url: user.urls.logout,
            type: 'logged-in',
        }
        ].filter(Boolean).map(link => ({ ...link, active: router.asPath === link.url }))
    )

    const shouldShow = link => {
        if (link.type === 'admin') {
            return user.admin;
        }
        if (link.type === 'logged-in') {
            return user.username;
        }
        if (link.type === 'not-logged-in') {
            return !user.username;
        }
        return true;
    }

    return (
        <>
            {links()
                .filter(shouldShow)
                .map(link => {
                    const b = (
                        <Button
                            key={link.name}
                            variant="text"
                            component="a"
                            href={link.url}
                            color="inherit"
                        >
                            {link.name}
                        </Button>
                    );

                    return (!link.next ? b :
                        <Link key={link.name} href={link.url} shallow>
                            {b}
                        </Link>
                    )
                })
            }
        </>
    )
}

export default memo(Menu)
