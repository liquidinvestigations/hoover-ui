import { CircularProgress, Collapse, Fade, Grid, IconButton, ListItemButton, Typography } from '@mui/material'
import { cloneElement, FC, MouseEvent as ReactMouseEvent, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { reactIcons } from '../../../constants/icons'
import { ThinProgress } from '../ThinProgress/ThinProgress'

import { useStyles } from './Expandable.styles'

let startY: number, startHeight: number

interface ExpandableProps {
    title: ReactNode
    children: ReactNode | ReactNode[]
    loading?: boolean
    loadingETA?: number
    loadingHeight?: number
    summary?: ReactNode
    greyed?: boolean
    defaultOpen?: boolean
    open?: boolean
    onToggle?: (open: boolean) => void
    resizable?: boolean
    fullHeight?: boolean
    highlight?: boolean
    contentVisible?: boolean
}

export const Expandable: FC<ExpandableProps> = ({
    title,
    loading,
    loadingETA,
    loadingHeight,
    summary,
    children,
    greyed = false,
    defaultOpen = false,
    open,
    onToggle,
    resizable = false,
    fullHeight = true,
    highlight = true,
    contentVisible = true,
}) => {
    const { classes, cx } = useStyles()

    let openState = open,
        setOpenState = onToggle

    const [openInternalState, setOpenInternalState] = useState(defaultOpen || false)
    if (typeof open === 'undefined') {
        openState = openInternalState
        setOpenState = setOpenInternalState
    }

    const contentRef: RefObject<HTMLDivElement> = useRef(null)

    useEffect(() => {
        if (!fullHeight && contentRef?.current) {
            contentRef.current.style.height = contentRef.current.offsetHeight + 'px'
        }
    }, [contentRef, fullHeight])

    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault()
        if (contentRef.current) {
            contentRef.current.style.height = startHeight + event.clientY - startY + 'px'
            contentRef.current.style.maxHeight = 'none'
        }
    }, [])

    const handleMouseUp = useCallback(
        (event: MouseEvent) => {
            event.preventDefault()
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mousemove', handleMouseMove)
        },
        [handleMouseMove],
    )

    const handleMouseDown = useCallback(
        (event: ReactMouseEvent) => {
            event.preventDefault()
            startY = event.clientY
            startHeight = contentRef.current?.offsetHeight || 0
            window.addEventListener('mouseup', handleMouseUp, { once: true })
            window.addEventListener('mousemove', handleMouseMove)
        },
        [handleMouseMove, handleMouseUp],
    )

    const headerBar = useMemo(() => {
        const toggle = () => setOpenState && setOpenState(!openState)

        return (
            <ListItemButton dense onClick={toggle} className={cx(classes.header, { [classes.enabled]: contentVisible })} disabled={!contentVisible}>
                <Fade in={loading} unmountOnExit>
                    <div>
                        <ThinProgress eta={loadingETA || 0} height={loadingHeight} />
                    </div>
                </Fade>

                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography
                            variant="body2"
                            component="div"
                            className={classes.title}
                            color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}>
                            {title}
                            {loading && <CircularProgress size={16} thickness={4} className={classes.loading} />}
                        </Typography>
                    </Grid>

                    {summary && (
                        <Grid item flex="1" textAlign="right">
                            {summary}
                        </Grid>
                    )}

                    {typeof open === 'undefined' && contentVisible && (
                        <Grid item>
                            <IconButton
                                size="small"
                                className={cx(classes.expand, {
                                    [classes.expandOpen]: openState,
                                })}
                                onClick={toggle}
                                aria-expanded={openState}
                                aria-label="Show more">
                                {cloneElement(reactIcons.chevronDown, { color: highlight ? 'secondary' : 'action' })}
                            </IconButton>
                        </Grid>
                    )}
                </Grid>
            </ListItemButton>
        )
    }, [
        cx,
        classes.header,
        classes.enabled,
        classes.title,
        classes.loading,
        classes.expand,
        classes.expandOpen,
        contentVisible,
        loading,
        loadingETA,
        loadingHeight,
        greyed,
        highlight,
        title,
        summary,
        open,
        openState,
        setOpenState,
    ])

    return (
        <>
            {headerBar}

            <Collapse in={openState} classes={{ entered: cx({ [classes.fullHeightCollapseEntered]: fullHeight }) }}>
                <div ref={contentRef} className={cx(classes.content, { [classes.fullHeightContent]: fullHeight })}>
                    {children}
                </div>

                {resizable && contentVisible && <div role="presentation" className={cx('Resizer horizontal')} onMouseDown={handleMouseDown} />}
            </Collapse>
        </>
    )
}
