import React, { memo } from 'react'
import Link from 'next/link'
import { makeStyles } from '@mui/styles'
import { AppBar, Toolbar, Typography } from '@mui/material'
import { useUser } from './UserProvider'
import Menu from './Menu'

const useStyles = makeStyles(theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },
    flex: {
        flexGrow: 1,
    },
    noLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
}))

function Header() {
    const classes = useStyles()
    const whoAmI = useUser()

    return (
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={classes.flex}
                    >
                        <Link href="/">
                            <a className={classes.noLink}>{whoAmI.title}</a>
                        </Link>
                        {' ⟶ '}
                        <a href={whoAmI.liquid.url} className={classes.noLink}>
                            {whoAmI.liquid.title}
                        </a>
                    </Typography>
                    <Menu />
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default memo(Header)
