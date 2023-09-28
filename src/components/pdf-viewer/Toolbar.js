import { Grid, IconButton, Menu, MenuItem, TextField, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { cloneElement, memo, useEffect, useRef, useState } from 'react'
import screenfull from 'screenfull'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../constants/icons'

import { zoomIn, zoomOut } from './zooming'

const useStyles = makeStyles()((theme) => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.grey[400],
        borderWidth: 1,
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
    toolbarIcon: {
        marginRight: theme.spacing(1),
    },
    pageInfo: {
        display: 'inline-flex',
        alignItems: 'center',
        '& span': {
            marginLeft: theme.spacing(0.5),
        },
    },
    pageNumber: {
        width: 60,
        backgroundColor: theme.palette.background.default,
        '& .MuiOutlinedInput-inputMarginDense': {
            textAlign: 'right',
            padding: '5px 8px',
        },
        '& .MuiOutlinedInput-input': {
            padding: '5.5px 14px',
        },
    },
    scaleSelect: {
        width: 80,
        paddingRight: 4,
        cursor: 'pointer',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            border: '1px solid rgba(0, 0, 0, 0.87)',
        },
        '& .MuiOutlinedInput-input': {
            width: 50,
            textAlign: 'right',
            display: 'inline-block',
            padding: '5px 0 5px 8px',
        },
    },
}))

function Toolbar({
    viewerRef,
    containerRef,
    pagesRefs,
    currentPageIndex,
    numPages,
    firstPageData,
    pageMargin,
    scale,
    setScale,
    toggleSidePanel,
    fullscreenClass,
    fullscreenExitClass,
}) {
    const { classes, cx } = useStyles()
    const pageInputRef = useRef()

    const [anchorEl, setAnchorEl] = useState(null)
    const handleScaleMenuClick = (event) => setAnchorEl(event.currentTarget)
    const handleScaleMenuClose = () => setAnchorEl(null)
    const handleScaleSet = (newScale) => () => {
        handleScaleMenuClose()
        const containerWidth = containerRef.current.clientWidth - pageMargin
        const containerHeight = containerRef.current.clientHeight - pageMargin
        if (newScale === 'page') {
            setScale(Math.min(containerWidth / firstPageData.width, containerHeight / firstPageData.height))
        } else if (newScale === 'width') {
            setScale(containerWidth / firstPageData.width)
        } else {
            setScale(newScale)
        }
        const pageSpaces = currentPageIndex * 27
        const scrollTopPages = ((containerRef.current.scrollTop - pageSpaces) * newScale) / scale
        containerRef.current.scrollTop = scrollTopPages + pageSpaces
    }

    const scrollToPage = (index) => (containerRef.current.scrollTop = pagesRefs[index].current.offsetTop)

    const onPrevPage = () => scrollToPage(currentPageIndex - 1)
    const onNextPage = () => scrollToPage(currentPageIndex + 1)
    const onPageFocus = () => pageInputRef.current.select()
    const onPageBlur = () => onPageChange()
    const onPageKey = (event) => {
        if (event.keyCode === 13) {
            onPageChange()
            pageInputRef.current.blur()
        }
        if (
            !Array(10)
                .fill()
                .map((_, i) => '' + i)
                .includes(event.key)
        ) {
            event.preventDefault()
        }
    }
    const onPageChange = () => {
        const page = parseInt(pageInputRef.current.value)
        if (!isNaN(page) && page > 0 && page <= numPages) {
            scrollToPage(page - 1)
        } else {
            pageInputRef.current.value = currentPageIndex + 1
        }
    }
    useEffect(() => {
        pageInputRef.current.value = currentPageIndex + 1
    }, [currentPageIndex])

    const onZoomOut = () => handleScaleSet(zoomOut(scale))()
    const onZoomIn = () => handleScaleSet(zoomIn(scale))()

    const onFullScreen = () => screenfull.request(viewerRef.current)
    const onFullScreenExit = () => screenfull.exit()

    const popperProps = {
        container: viewerRef.current,
    }

    return (
        <>
            <MuiToolbar variant="dense" classes={{ root: classes.toolbar }}>
                <Grid container justifyContent="space-between" gap={0.5}>
                    <Grid item display="flex" alignItems="center">
                        <Tooltip title="Side panel" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={toggleSidePanel} className={classes.toolbarIcon} style={{ marginRight: 50 }}>
                                    {reactIcons.viewerSidePanel}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Previous page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onPrevPage}
                                    disabled={!firstPageData || currentPageIndex === 0}
                                    className={classes.toolbarIcon}
                                >
                                    {reactIcons.arrowUp}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Next page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onNextPage}
                                    disabled={!firstPageData || currentPageIndex === numPages - 1}
                                    className={classes.toolbarIcon}
                                >
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
                                        defaultValue={currentPageIndex + 1}
                                        className={classes.pageNumber}
                                        onFocus={onPageFocus}
                                        onBlur={onPageBlur}
                                        onKeyDown={onPageKey}
                                        disabled={!firstPageData}
                                    />
                                </span>
                            </Tooltip>
                            <span>of</span>
                            <span>{numPages}</span>
                        </div>
                    </Grid>
                    <Grid item display="flex" alignItems="center">
                        <Tooltip title="Zoom out" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={onZoomOut} className={classes.toolbarIcon} disabled={!firstPageData}>
                                    {reactIcons.zoomOut}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Zoom in" PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={onZoomIn} className={classes.toolbarIcon} disabled={!firstPageData}>
                                    {reactIcons.zoomIn}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Scale" PopperProps={popperProps}>
                            <div
                                className={cx('MuiInputBase-root', 'MuiOutlinedInput-root', 'MuiInputBase-formControl', classes.scaleSelect, {
                                    'Mui-disabled': !firstPageData,
                                })}
                                onClick={!!firstPageData ? handleScaleMenuClick : null}
                            >
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
                                <IconButton size="small" onClick={onFullScreen} className={fullscreenClass}>
                                    {reactIcons.fullscreen}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exit full screen" PopperProps={popperProps}>
                                <IconButton size="small" onClick={onFullScreenExit} className={fullscreenExitClass}>
                                    {reactIcons.fullscreenExit}
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    )}
                </Grid>
            </MuiToolbar>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleScaleMenuClose} disableScrollLock={true} {...popperProps}>
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
}

export default memo(Toolbar)
