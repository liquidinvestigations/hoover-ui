import React, { createRef, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { Grid, IconButton, Menu, MenuItem, TextField, Toolbar, Tooltip } from '@material-ui/core'
import { ArrowDownward, ArrowDropDown, ArrowUpward, Fullscreen, FullscreenExit, ZoomIn, ZoomOut } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { STATUS_COMPLETE, STATUS_LOADING, useDocument } from './DocumentProvider'
import Page from './Page'
import { zoomIn, zoomOut } from './zooming'
import Loading from '../../Loading'

const useStyles = makeStyles(theme => ({
    viewer: {
        '&:fullscreen': {
            '& $container': {
                height: 'calc(100vh - 48px)',
            },
            '& $fullscreen': {
                display: 'none',
            },
            '& $fullscreenExit': {
                display: 'inline-flex',
            },
        },
    },
    fullscreen: {},
    fullscreenExit: {
        display: 'none',
    },
    container: {
        height: '50vh',
        overflow: 'auto',
        position: 'relative',
        boxSizing: 'content-box',
        backgroundColor: theme.palette.grey[200],

        '& .page': {
            marginBottom: theme.spacing(1),

            '& .svgLayer': {
                position: 'absolute',
                top: 0,
                left: 0,
            }
        }
    },
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
            marginLeft: theme.spacing(0.5)
        }
    },
    pageNumber: {
        width: 60,
        backgroundColor: theme.palette.background.default,
        '& .MuiOutlinedInput-inputMarginDense': {
            textAlign: 'right',
            padding: '5px 8px',
        }
    },
    scaleSelect: {
        width: 120,
        paddingRight: 4,
        cursor: 'pointer',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        backgroundColor: theme.palette.background.default,
        '&:hover': {
            border: '1px solid rgba(0, 0, 0, 0.87)',
        },
        '& .MuiOutlinedInput-input': {
            width: 80,
            textAlign: 'right',
            display: 'inline-block',
            padding: '5px 0 5px 8px',
        },
    },
}))

const pageMargin = 20

export default function Document({ initialPageIndex, onPageIndexChange, renderer = 'canvas' }) {
    const classes = useStyles()
    const { doc, firstPageData, status, percent } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [pagesRefs, setPagesRefs] = useState([])

    const viewerRef = useRef()
    const containerRef = useRef()
    const pageInputRef = useRef()

    useEffect(() => {
        if (doc?.numPages) {
            setPagesRefs(pagesRefs =>
                Array(doc.numPages).fill().map((_, i) => pagesRefs[i] || createRef())
            )
        }
    }, [doc])

    useEffect(() => {
        if (firstPageData?.width && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth - pageMargin - 20
            if (firstPageData.width > containerWidth) {
                setScale(containerWidth / firstPageData.width)
            }
        }
    }, [firstPageData])

    useEffect(() => {
        if (status === STATUS_COMPLETE && initialPageIndex > 0 && pagesRefs[initialPageIndex]) {
            scrollToPage(initialPageIndex)
        }
    }, [status])

    const pageVisibility = Array(doc?.numPages || 0).fill().map(() => 0)

    const onPageVisibilityChange = (changedPageIndex, ratio) => {
        if (status === STATUS_COMPLETE) {
            pageVisibility[changedPageIndex] = ratio
            const maxRatioPage = pageVisibility.reduce(
                (maxIndex, item, index, array) =>
                    item > array[maxIndex] ? index : maxIndex, 0
            )
            onPageIndexChange(maxRatioPage)
        }
    }

    const [anchorEl, setAnchorEl] = useState(null)
    const handleScaleMenuClick = event => setAnchorEl(event.currentTarget)
    const handleScaleMenuClose = () => setAnchorEl(null)
    const handleScaleSet = scale => () => {
        handleScaleMenuClose()
        const containerWidth = containerRef.current.clientWidth - pageMargin
        const containerHeight = containerRef.current.clientHeight - pageMargin
        if (scale === 'page') {
            setScale(Math.min(containerWidth / firstPageData.width, containerHeight / firstPageData.height))
        } else if (scale === 'width') {
            setScale(containerWidth / firstPageData.width)
        } else {
            setScale(scale)
        }
    }

    const scrollToPage = index => containerRef.current.scrollTop = pagesRefs[index].current.offsetTop

    const onPrevPage = () => scrollToPage(initialPageIndex - 1)
    const onNextPage = () => scrollToPage(initialPageIndex + 1)
    const onPageFocus = () => pageInputRef.current.select()
    const onPageChange = event => {
        const page = parseInt(event.target.value)
        if (!isNaN(page) && page > 0 && page <= doc?.numPages) {
            scrollToPage(page - 1)
        }
    }

    const onZoomOut = () => setScale(zoomOut(scale))
    const onZoomIn = () => setScale(zoomIn(scale))

    const onFullScreen = () => viewerRef.current.requestFullscreen()
    const onFullScreenExit = () => document.exitFullscreen()

    const popperProps = {
        container: viewerRef.current
    }

    return (
        <div ref={viewerRef} className={classes.viewer}>
            <Toolbar variant="dense" classes={{root: classes.toolbar}}>
                <Grid container justify="space-between">
                    <Grid item>
                        <Tooltip title="Previous page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onPrevPage}
                                    disabled={status === STATUS_LOADING || initialPageIndex === 0}
                                    className={classes.toolbarIcon}
                                >
                                    <ArrowUpward />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Next page" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onNextPage}
                                    disabled={status === STATUS_LOADING || initialPageIndex === doc?.numPages - 1}
                                    className={classes.toolbarIcon}
                                >
                                    <ArrowDownward />
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
                                        value={initialPageIndex + 1}
                                        className={classes.pageNumber}
                                        onFocus={onPageFocus}
                                        onChange={onPageChange}
                                        disabled={status === STATUS_LOADING}
                                    />
                                </span>
                            </Tooltip>
                            <span>
                                of
                            </span>
                            <span>
                                {doc?.numPages}
                            </span>
                        </div>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Zoom out" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onZoomOut}
                                    className={classes.toolbarIcon}
                                    disabled={status === STATUS_LOADING}
                                >
                                    <ZoomOut />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Zoom in" PopperProps={popperProps}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onZoomIn}
                                    className={classes.toolbarIcon}
                                    disabled={status === STATUS_LOADING}
                                >
                                    <ZoomIn />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Scale" PopperProps={popperProps}>
                            <div className={cn(
                                    'MuiInputBase-root',
                                    'MuiOutlinedInput-root',
                                    'MuiInputBase-formControl',
                                    classes.scaleSelect,
                                    {
                                        'Mui-disabled': status === STATUS_LOADING
                                    }
                                )}
                                onClick={status === STATUS_COMPLETE ? handleScaleMenuClick : null}
                            >
                                <span className={cn(
                                    'MuiInputBase-input',
                                    'MuiOutlinedInput-input',
                                )}>
                                    {Math.round(scale * 100) + '%'}
                                </span>
                                <ArrowDropDown className={cn(
                                    'MuiSelect-icon',
                                    'MuiSelect-iconOutlined'
                                )}/>
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Full screen" PopperProps={popperProps}>
                            <IconButton
                                size="small"
                                onClick={onFullScreen}
                                className={classes.fullscreen}
                            >
                                <Fullscreen />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Exit full screen" PopperProps={popperProps}>
                            <IconButton
                                size="small"
                                onClick={onFullScreenExit}
                                className={classes.fullscreenExit}
                            >
                                <FullscreenExit />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Toolbar>

            <div className={cn(classes.container, 'pdfViewer')} ref={containerRef}>
                {status === STATUS_LOADING &&
                    <Loading
                        variant={percent > 0 ? 'determinate' : 'indeterminate'}
                        value={percent}
                    />
                }
                {status === STATUS_COMPLETE &&
                    Array(doc.numPages).fill().map((_, index) => {
                       return  (
                           <Page
                               key={index}
                               ref={pagesRefs[index]}
                               doc={doc}
                               renderer={renderer}
                               pageIndex={index}
                               width={firstPageData.width}
                               height={firstPageData.height}
                               rotation={rotation}
                               scale={scale}
                               onVisibilityChanged={onPageVisibilityChange}
                           />
                       )
                    })
                }
            </div>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleScaleMenuClose}
                disableScrollLock={true}
                {...popperProps}
            >
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
        </div>
    )
}
