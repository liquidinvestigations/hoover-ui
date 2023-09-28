import { AppBar, Toolbar, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'

import { useSharedStore } from '../../SharedStoreProvider'
import { Menu } from '../Menu/Menu'

import { useStyles } from './Header.styles'

export const Header = observer(() => {
    const { classes } = useStyles()
    const { user } = useSharedStore()

    return (
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar variant="dense">
                    <Typography variant="h6" color="inherit" className={classes.flex}>
                        <Link href="/" className={classes.noLink}>
                            {user?.title}
                        </Link>
                        {' ⟶ '}
                        <a href={user?.liquid.url} className={classes.noLink}>
                            {user?.liquid.title}
                        </a>
                    </Typography>
                    <Menu />
                </Toolbar>
            </AppBar>
        </div>
    )
})
