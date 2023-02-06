import React, { memo } from 'react'
import Link from 'next/link'
import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import { useUser } from './UserProvider'

function Menu() {
    const router = useRouter()
    const whoAmI = useUser()

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
            url: whoAmI.urls.login,
            type: 'not-logged-in',
        },
        {
            name: 'Admin',
            url: whoAmI.urls.admin,
            type: 'admin',
        },
        {
            name: `Logout (${whoAmI.username})`,
            url: whoAmI.urls.logout,
            type: 'logged-in',
        }
        ].filter(Boolean).map(link => ({ ...link, active: router.asPath === link.url }))
    )

    const shouldShow = link => {
        if (link.type === 'admin') {
            return whoAmI.admin;
        }
        if (link.type === 'logged-in') {
            return whoAmI.username;
        }
        if (link.type === 'not-logged-in') {
            return !whoAmI.username;
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
