import { Grid, IconButton, Menu, MenuItem, TextField, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { cloneElement, FC, KeyboardEvent, RefObject, MouseEvent, useEffect, useRef, useState } from 'react'
import screenfull from 'screenfull'

import { reactIcons } from '../../../constants/icons'
import { FirstPageData } from '../DocumentProvider'
import { zoomIn, zoomOut } from '../zooming'

import { useStyles } from './Toolbar.styles'

interface ToolbarProps {
    viewerRef: RefObject<HTMLDivElement>
    containerRef: RefObject<HTMLDivElement>
    pagesRefs: RefObject<HTMLDivElement>[]
    currentPageIndex: number
    numPages?: number
    firstPageData?: FirstPageData
    pageMargin: number
    scale: number
    setScale: (scale: number) => void
    toggleSidePanel: () => void
    fullscreenClass: string
    fullscreenExitClass: string
}

export const Toolbar: FC<ToolbarProps> = ({
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
}) => {
    const { t } = useTranslate()
    const { classes, cx } = useStyles()
    const pageInputRef = useRef<HTMLInputElement>()

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)
    const handleScaleMenuClick = (event: MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)
    const handleScaleMenuClose = () => setAnchorEl(null)
    const handleScaleSet = (newScale: number | string) => () => {
        handleScaleMenuClose()
        if (containerRef.current && firstPageData) {
            const containerWidth = containerRef.current.clientWidth - pageMargin
            const containerHeight = containerRef.current.clientHeight - pageMargin
            if (newScale === 'page') {
                setScale(Math.min(containerWidth / firstPageData.width, containerHeight / firstPageData.height))
            } else if (newScale === 'width') {
                setScale(containerWidth / firstPageData.width)
            } else {
                setScale(newScale as number)
            }
            const pageSpaces = currentPageIndex * 27
            const scrollTopPages = ((containerRef.current.scrollTop - pageSpaces) * (newScale as number)) / scale
            containerRef.current.scrollTop = scrollTopPages + pageSpaces
        }
    }

    const scrollToPage = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTop = pagesRefs[index].current?.offsetTop || 0
        }
    }

    const onPrevPage = () => scrollToPage(currentPageIndex - 1)
    const onNextPage = () => scrollToPage(currentPageIndex + 1)
    const onPageFocus = () => pageInputRef.current?.select()
    const onPageBlur = () => onPageChange()
    const onPageKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            onPageChange()
            pageInputRef.current?.blur()
        }
        if (
            !Array(10)
                .fill(0)
                .map((_, i) => '' + i)
                .includes(event.key)
        ) {
            event.preventDefault()
        }
    }
    const onPageChange = () => {
        if (pageInputRef.current && numPages) {
            const page = parseInt(pageInputRef.current.value)
            if (!isNaN(page) && page > 0 && page <= numPages) {
                scrollToPage(page - 1)
            } else {
                pageInputRef.current.value = (currentPageIndex + 1).toString()
            }
        }
    }
    useEffect(() => {
        if (pageInputRef.current) {
            pageInputRef.current.value = (currentPageIndex + 1).toString()
        }
    }, [currentPageIndex])

    const onZoomOut = () => handleScaleSet(zoomOut(scale))()
    const onZoomIn = () => handleScaleSet(zoomIn(scale))()

    const onFullScreen = () => viewerRef.current && screenfull.request(viewerRef.current)
    const onFullScreenExit = () => screenfull.exit()

    const popperProps = {
        container: viewerRef.current,
    }

    return (
        <>
            <MuiToolbar variant="dense" classes={{ root: classes.toolbar }}>
                <Grid container justifyContent="space-between" gap={0.5}>
                    <Grid item display="flex" alignItems="center">
                        <Tooltip title={t('side_panel', 'Side panel')} PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={toggleSidePanel} className={classes.toolbarIcon} style={{ marginRight: 50 }}>
                                    {reactIcons.viewerSidePanel}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('previous_page', 'Previous page')} PopperProps={popperProps}>
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
                        <Tooltip title={t('next_page', 'Next page')} PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onNextPage}
                                    disabled={!firstPageData || !numPages || currentPageIndex === numPages - 1}
                                    className={classes.toolbarIcon}
                                >
                                    {reactIcons.arrowDown}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <div className={classes.pageInfo}>
                            <Tooltip title={t('page', 'Page')} PopperProps={popperProps}>
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
                        <Tooltip title={t('zoom_out', 'Zoom out')} PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={onZoomOut} className={classes.toolbarIcon} disabled={!firstPageData}>
                                    {reactIcons.zoomOut}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('zoom_in', 'Zoom in')} PopperProps={popperProps}>
                            <span>
                                <IconButton size="small" onClick={onZoomIn} className={classes.toolbarIcon} disabled={!firstPageData}>
                                    {reactIcons.zoomIn}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('scale', 'Scale')} PopperProps={popperProps}>
                            <div
                                className={cx('MuiInputBase-root', 'MuiOutlinedInput-root', 'MuiInputBase-formControl', classes.scaleSelect, {
                                    'Mui-disabled': !firstPageData,
                                })}
                                onClick={firstPageData ? handleScaleMenuClick : undefined}
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
                            <Tooltip title={t('full_screen', 'Full screen')} PopperProps={popperProps}>
                                <IconButton size="small" onClick={onFullScreen} className={fullscreenClass}>
                                    {reactIcons.fullscreen}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('exit_full_screen', 'Exit full screen')} PopperProps={popperProps}>
                                <IconButton size="small" onClick={onFullScreenExit} className={fullscreenExitClass}>
                                    {reactIcons.fullscreenExit}
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    )}
                </Grid>
            </MuiToolbar>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleScaleMenuClose} disableScrollLock={true} {...popperProps}>
                <MenuItem onClick={handleScaleSet(1)}>
                    <T keyName="scale_original">Original</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet('page')}>
                    <T keyName="scale_page_fit">Page fit</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet('width')}>
                    <T keyName="scale_page_width">Page width</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(0.5)}>
                    <T keyName="scale_50%">50%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(0.75)}>
                    <T keyName="scale_75%">75%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(1)}>
                    <T keyName="scale_100%">100%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(1.25)}>
                    <T keyName="scale_125%">125%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(1.5)}>
                    <T keyName="scale_150%">150%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(2)}>
                    <T keyName="scale_200%">200%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(3)}>
                    <T keyName="scale_300%">300%</T>
                </MenuItem>
                <MenuItem onClick={handleScaleSet(4)}>
                    <T keyName="scale_400%">400%</T>
                </MenuItem>
            </Menu>
        </>
    )
}
