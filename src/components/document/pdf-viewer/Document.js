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

export default function Document({ initialPage, onPageIndexChange, renderer = 'canvas' }) {
    const classes = useStyles()
    const { doc, firstPageData, status, percent } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [pagesRefs, setPagesRefs] = useState([])
    const [currentPageIndex, setCurrentPageIndex] = useState(initialPage || 1)

    const viewerRef = useRef()
    const containerRef = useRef()

    useEffect(() => {
        if (doc?.numPages) {
            setPagesRefs(pagesRefs =>
                Array(doc.numPages).fill().map((_, i) => pagesRefs[i] || createRef())
            )
        }
    }, [doc])

    useEffect(() => {
        if (firstPageData?.width && containerRef.current) {
            if (firstPageData.width > containerRef.current.clientWidth - 50) {
                setScale(zoomOut((containerRef.current.clientWidth - 50) / firstPageData.width))
            }
        }
    }, [firstPageData])

    const onPageVisibilityChange = (pageIndex, ratio) => {
        if (ratio >= 0.5) {
            setCurrentPageIndex(pageIndex)
            onPageIndexChange(pageIndex)
        }
    }

    const [anchorEl, setAnchorEl] = useState(null)
    const handleScaleMenuClick = event => setAnchorEl(event.currentTarget)
    const handleScaleMenuClose = () => setAnchorEl(null)
    const handleScaleSet = scale => () => {
        handleScaleMenuClose()
        if (scale === 'page') {

        } else if (scale === 'width') {

        } else {
            setScale(scale)
        }
    }

    const onPrevPage = () => containerRef.current.scrollTop = pagesRefs[currentPageIndex - 1].current.offsetTop
    const onNextPage = () => containerRef.current.scrollTop = pagesRefs[currentPageIndex + 1].current.offsetTop
    const onZoomOut = () => setScale(zoomOut(scale))
    const onZoomIn = () => setScale(zoomIn(scale))
    const onFullScreen = () => viewerRef.current.requestFullscreen()
    const onFullScreenExit = () => document.exitFullscreen()

    return (
        <div ref={viewerRef} className={classes.viewer}>
            <Toolbar variant="dense" classes={{root: classes.toolbar}}>
                <Grid container justify="space-between">
                    <Grid item>
                        <Tooltip title="Previous page">
                            <IconButton
                                size="small"
                                onClick={onPrevPage}
                                disabled={currentPageIndex === 0}
                                className={classes.toolbarIcon}
                            >
                                <ArrowUpward />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Next page">
                            <IconButton
                                size="small"
                                onClick={onNextPage}
                                disabled={currentPageIndex === doc?.numPages - 1}
                                className={classes.toolbarIcon}
                            >
                                <ArrowDownward />
                            </IconButton>
                        </Tooltip>
                        <div className={classes.pageInfo}>
                            <Tooltip title="Page">
                                <TextField
                                    size="small"
                                    variant="outlined"
                                    value={currentPageIndex + 1}
                                    className={classes.pageNumber}
                                />
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
                        <Tooltip title="Zoom out">
                            <IconButton
                                size="small"
                                onClick={onZoomOut}
                                className={classes.toolbarIcon}
                            >
                                <ZoomOut />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Zoom in">
                            <IconButton
                                size="small"
                                onClick={onZoomIn}
                                className={classes.toolbarIcon}
                            >
                                <ZoomIn />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Scale">
                            <div className={cn(
                                    'MuiInputBase-root',
                                    'MuiOutlinedInput-root',
                                    'MuiInputBase-formControl',
                                    classes.scaleSelect
                                )}
                                onClick={handleScaleMenuClick}
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
                        <Tooltip title="Full screen">
                            <IconButton
                                size="small"
                                onClick={onFullScreen}
                                className={classes.fullscreen}
                            >
                                <Fullscreen />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Exit full screen">
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
