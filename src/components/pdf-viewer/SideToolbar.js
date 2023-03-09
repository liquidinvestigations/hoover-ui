import { Grid, IconButton, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { makeStyles } from '@mui/styles'

import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles((theme) => ({
    toolbar: {
        borderColor: theme.palette.grey[400],
        borderBottomStyle: 'solid',
        borderWidth: 1,
    },
    toolbarIcon: {
        marginRight: theme.spacing(2.3),
    },
}))

export default function SideToolbar({ viewerRef, currentTab, onTabSwitch }) {
    const classes = useStyles()

    const openTab = (tab) => () => {
        onTabSwitch(tab)
    }

    const popperProps = {
        container: viewerRef.current,
    }

    return (
        <MuiToolbar variant="dense" className={classes.toolbar}>
            <Grid container justifyContent="flex-start">
                <Grid item>
                    <Tooltip title="Thumbnails" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={openTab('thumbnails')}>
                                {reactIcons.thumbnails}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Bookmarks" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={openTab('bookmarks')}>
                                {reactIcons.contentTab}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Attachments" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={openTab('attachments')}>
                                {reactIcons.attachment}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
        </MuiToolbar>
    )
}
