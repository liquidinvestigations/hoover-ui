import { AppBar, Toolbar, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'

import { Menu } from './Menu'
import { useSharedStore } from './SharedStoreProvider'

const useStyles = makeStyles((theme) => ({
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

export const Header = observer(() => {
    const classes = useStyles()
    const { user } = useSharedStore()

    return (
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        <Link href="/" className={classes.noLink}>
                            {user.title}
                        </Link>
                        {' ⟶ '}
                        <a href={user.liquid.url} className={classes.noLink}>
                            {user.liquid.title}
                        </a>
                    </Typography>
                    <Menu />
                </Toolbar>
            </AppBar>
        </div>
    )
})
