import { Grid, IconButton, Theme, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { reactIcons } from '../../../constants/icons'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './SideToolbar.styles'

export const SideToolbar: FC = observer(() => {
    const { classes } = useStyles()
    const { setSidebarTab, viewerRef } = useSharedStore().pdfViewerStore

    const popperProps = {
        container: viewerRef,
    }

    return (
        <MuiToolbar variant="dense" className={classes.toolbar}>
            <Grid container justifyContent="flex-start">
                <Grid item>
                    <Tooltip title="Thumbnails" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={setSidebarTab('thumbnails')}>
                                {reactIcons.thumbnails}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Bookmarks" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={setSidebarTab('bookmarks')}>
                                {reactIcons.contentTab}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Attachments" PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={setSidebarTab('attachments')}>
                                {reactIcons.attachment}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
        </MuiToolbar>
    )
})
