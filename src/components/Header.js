import React, { memo, useContext } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography } from '@material-ui/core'
import { UserContext } from '../../pages/_app'
import Menu from './Menu'
import Link from 'next/link'

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
    title: {
        '& a': {
            color: 'white',
            textDecoration: 'none',
        }
    }
}))

function Header() {
    const classes = useStyles()
    const whoAmI = useContext(UserContext)

    return (
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={classes.flex}>
                        <Link href="/">
                            <a
                                className={cn(classes.noLink, classes.title)}
                                dangerouslySetInnerHTML={{__html: whoAmI.title}}
                            />
                        </Link>
                    </Typography>
                    <Menu />
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default memo(Header)
