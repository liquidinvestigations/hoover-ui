import { Grid, IconButton, Menu, MenuItem, TextField, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC } from 'react'
import screenfull from 'screenfull'

import { reactIcons } from '../../../constants/icons'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './Toolbar.styles'

interface ToolbarProps {
    fullscreenClass: string
    fullscreenExitClass: string
}

export const Toolbar: FC<ToolbarProps> = observer(({ fullscreenClass, fullscreenExitClass }) => {
    const { classes } = useStyles()
    const {
        viewerRef,
        pageInputRef,
        scaleMenuAnchorEl,
        handleScaleMenuClick,
        handleScaleMenuClose,
        sidebarToggle,
        handlePrevPage,
        handleNextPage,
        handlePageInputFocus,
        handlePageInputBlur,
        handlePageInputKey,
        handleZoomOut,
        handleZoomIn,
        handleFullScreen,
        handleFullScreenExit,
        handleScaleSet,
        doc,
        firstPageProps,
        pageIndex,
        scale,
    } = useSharedStore().pdfViewerStore

    const popperProps = {
        container: viewerRef,
    }

    return (
        <>
            <MuiToolbar variant="dense" classes={{ root: classes.toolbar }}>
                <Grid container justifyContent="space-between" gap={0.5}>
                    <Grid item display="flex" alignItems="center">
                        <Tooltip title="Side panel" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={sidebarToggle} className={classes.toolbarIcon} style={{ marginRight: 50 }}>
                                    {reactIcons.viewerSidePanel}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Previous page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handlePrevPage}
                                    disabled={!firstPageProps || pageIndex === 0}
                                    className={classes.toolbarIcon}>
                                    {reactIcons.arrowUp}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Next page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleNextPage}
                                    disabled={!firstPageProps || pageIndex === (doc?.numPages || 0) - 1}
                                    className={classes.toolbarIcon}>
                                    {reactIcons.arrowDown}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <div className={classes.pageInfo}>
                            <Tooltip title="Page" PopperProps={popperProps}>
                                <span>
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        inputRef={pageInputRef}
                                        defaultValue={pageIndex + 1}
                                        className={classes.pageNumber}
                                        onFocus={handlePageInputFocus}
                                        onBlur={handlePageInputBlur}
                                        onKeyDown={handlePageInputKey}
                                        disabled={!firstPageProps}
                                    />
                                </span>
                            </Tooltip>
                            <span>of</span>
                            <span>{doc?.numPages}</span>
                        </div>
                    </Grid>
                    <Grid item display='flex' alignItems='center'>
                        <Tooltip title="Zoom out" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={handleZoomOut} className={classes.toolbarIcon} disabled={!firstPageProps}>
                                    {reactIcons.zoomOut}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Zoom in" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={handleZoomIn} className={classes.toolbarIcon} disabled={!firstPageProps}>
                                    {reactIcons.zoomIn}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Scale" PopperProps={popperProps}>
                            <div
                                className={cx('MuiInputBase-root', 'MuiOutlinedInput-root', 'MuiInputBase-formControl', classes.scaleSelect, {
                                    'Mui-disabled': !firstPageProps,
                                })}
                                onClick={!!firstPageProps ? handleScaleMenuClick : undefined}>
                                <span className={cx('MuiInputBase-input', 'MuiOutlinedInput-input')}>{Math.round(scale * 100) + '%'}</span>
                                {cloneElement(reactIcons.dropDown, {
                                    className: cx('MuiSelect-icon', 'MuiSelect-iconOutlined'),
                                })}
                            </div>
                        </Tooltip>
                    </Grid>
                    {screenfull.isEnabled && (
                        <Grid item>
                            <Tooltip title="Full screen" PopperProps={popperProps}>
                                <IconButton size="small" onClick={handleFullScreen} className={fullscreenClass}>
                                    {reactIcons.fullscreen}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exit full screen" PopperProps={popperProps}>
                                <IconButton size="small" onClick={handleFullScreenExit} className={fullscreenExitClass}>
                                    {reactIcons.fullscreenExit}
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    )}
                </Grid>
            </MuiToolbar>

            <Menu
                anchorEl={scaleMenuAnchorEl}
                open={Boolean(scaleMenuAnchorEl)}
                onClose={handleScaleMenuClose}
                disableScrollLock={true}
                {...popperProps}>
                <MenuItem onClick={handleScaleSet(1)}>Original</MenuItem>
                <MenuItem onClick={handleScaleSet('page')}>Page fit</MenuItem>
                <MenuItem onClick={handleScaleSet('width')}>Page width</MenuItem>
                <MenuItem onClick={handleScaleSet(0.5)}>50%</MenuItem>
                <MenuItem onClick={handleScaleSet(0.75)}>75%</MenuItem>
                <MenuItem onClick={handleScaleSet(1)}>100%</MenuItem>
                <MenuItem onClick={handleScaleSet(1.25)}>125%</MenuItem>
                <MenuItem onClick={handleScaleSet(1.5)}>150%</MenuItem>
                <MenuItem onClick={handleScaleSet(2)}>200%</MenuItem>
                <MenuItem onClick={handleScaleSet(3)}>300%</MenuItem>
                <MenuItem onClick={handleScaleSet(4)}>400%</MenuItem>
            </Menu>
        </>
    )
})
