import { Grid, IconButton, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { FC, RefObject } from 'react'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles()((theme) => ({
    toolbar: {
        borderColor: theme.palette.grey[400],
        borderBottomStyle: 'solid',
        borderWidth: 1,
    },
    toolbarIcon: {
        marginRight: theme.spacing(2.3),
    },
}))

interface SideToolbarProps {
    viewerRef: RefObject<HTMLDivElement>
    onTabSwitch: (tab: string) => void
}

export const SideToolbar: FC<SideToolbarProps> = ({ viewerRef, onTabSwitch }) => {
    const { t } = useTranslate()
    const { classes } = useStyles()

    const openTab = (tab: string) => () => {
        onTabSwitch(tab)
    }

    const popperProps = {
        container: viewerRef.current,
    }

    return (
        <MuiToolbar variant="dense" className={classes.toolbar}>
            <Grid container justifyContent="flex-start">
                <Grid item>
                    <Tooltip title={t('thumbnails', 'Thumbnails')} PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={openTab('thumbnails')}>
                                {reactIcons.thumbnails}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title={t('bookmarks', 'Bookmarks')} PopperProps={popperProps}>
                        <span>
                            <IconButton size="small" className={classes.toolbarIcon} onClick={openTab('bookmarks')}>
                                {reactIcons.contentTab}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title={t('attachments', 'Attachments')} PopperProps={popperProps}>
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
