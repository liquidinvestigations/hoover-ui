import React, { memo, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Typography } from '@material-ui/core'
import cn from 'classnames'
import Menu from './Menu';
import api from '../api';

const useStyles = makeStyles(theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },
    flex: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
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

const embedHypothesis = scriptUrl => {
    window.hypothesisConfig = () => ({
        showHighlights: true,
        appType: 'bookmarklet',
    })
    const scriptNode = document.createElement('script')
    scriptNode.setAttribute('src', scriptUrl)
    document.body.appendChild(scriptNode)
}

function Header() {
    const classes = useStyles()

    const [whoAmI, setWhoAmI] = useState({
        username: '',
        admin: false,
        urls: {},
        title: '',
    })

    useEffect(() => {
        api.whoami().then(whoAmI => {
            setWhoAmI(whoAmI)
            if (whoAmI.urls.hypothesis_embed) {
                embedHypothesis(whoAmI.urls.hypothesis_embed);
            }
        })
    }, [])

    return (
        <div className={classes.root}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={classes.flex}>
                        <a href="/"
                            className={cn(classes.noLink, classes.title)}
                            dangerouslySetInnerHTML={{__html: whoAmI.title}} />
                    </Typography>
                    <Menu whoAmI={whoAmI} />
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default memo(Header)
