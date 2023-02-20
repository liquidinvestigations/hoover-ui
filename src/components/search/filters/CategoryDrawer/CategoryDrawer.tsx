import { ClickAwayListener, Fade, Grid, ListItem, Portal, Slide, Typography } from '@mui/material'
import { duration } from '@mui/material/styles'
import cx from 'classnames'
import { cloneElement, CSSProperties, FC, ReactNode, RefObject, useEffect, useMemo, useState } from 'react'
import { Transition } from 'react-transition-group'

import { reactIcons } from '../../../../constants/icons'
import { Category } from '../../../../Types'
import { ThinProgress } from '../../ThinProgress'

import { useStyles } from './CategoryDrawer.styles'

const hasDisabledClickAway = (element: HTMLElement): boolean => {
    if (element.dataset?.disableClickAway) {
        return true
    }
    return !!element.parentNode && hasDisabledClickAway(element.parentNode as HTMLElement)
}

interface CategoryDrawerProps {
    category: Category
    title: string
    icon: keyof typeof reactIcons
    children: ReactNode | ReactNode[]
    wideFilters: boolean
    portalRef: RefObject<HTMLDivElement>
    width: number
    pinned: boolean
    toolbar: JSX.Element
    loading?: boolean
    loadingETA?: number
    open: boolean
    onOpen: (category: Category | undefined) => void
    greyed?: boolean
    highlight?: boolean
}

export const CategoryDrawer: FC<CategoryDrawerProps> = ({
    category,
    title,
    icon,
    children,
    wideFilters,
    portalRef,
    width,
    pinned,
    toolbar,
    loading,
    loadingETA,
    open,
    onOpen,
    greyed = false,
    highlight = true,
}) => {
    const classes = useStyles()
    const [position, setPosition] = useState<Partial<CSSProperties>>({ top: 0, left: 0, width: 0 })

    const updatePosition = () => {
        const position = portalRef.current?.getBoundingClientRect()
        const scrollTop = portalRef.current?.parentElement?.scrollTop

        if (position && scrollTop) {
            setPosition({
                top: position.top + scrollTop + 'px',
                left: position.left + 'px',
                width,
            })
        }
    }

    useEffect(() => {
        if (portalRef.current) {
            updatePosition()
        }
    }, [portalRef.current, width, wideFilters, pinned])

    const titleBar = useMemo(
        () => (
            <ListItem
                dense
                button
                data-disable-click-away
                onClick={() => onOpen(category)}
                className={cx({ [classes.openCollapsed]: !wideFilters && open })}>
                <Fade in={loading} unmountOnExit>
                    <div>
                        <ThinProgress eta={loadingETA || 0} />
                    </div>
                </Fade>

                <Grid container alignItems="baseline" justifyContent="space-between" wrap="nowrap">
                    <Grid item className={classes.icon}>
                        {cloneElement(reactIcons[icon], { color: highlight ? 'secondary' : 'inherit' })}
                    </Grid>

                    <Grid item className={classes.label}>
                        <Typography
                            noWrap
                            variant="body2"
                            component="div"
                            className={cx(classes.title, { [classes.bold]: open })}
                            color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}>
                            {title}
                        </Typography>
                    </Grid>

                    {open && (
                        <Grid item className={classes.open}>
                            {cloneElement(reactIcons.chevronRight, { color: highlight ? 'secondary' : 'action' })}
                        </Grid>
                    )}
                </Grid>
            </ListItem>
        ),
        [category, title, greyed, highlight, wideFilters, open, onOpen, loading, loadingETA]
    )

    return (
        <>
            {titleBar}

            {(!pinned || (pinned && portalRef.current)) && (
                <Portal container={typeof document !== 'undefined' && pinned ? portalRef.current : undefined}>
                    <Transition
                        in={open}
                        timeout={{
                            enter: duration.enteringScreen,
                            exit: duration.leavingScreen,
                        }}
                        mountOnEnter
                        unmountOnExit
                        onEntering={updatePosition}
                        onExiting={updatePosition}>
                        <ClickAwayListener
                            onClickAway={(event) => {
                                !pinned && !hasDisabledClickAway(event.target as HTMLElement) && onOpen(undefined)
                            }}
                            disableReactTree>
                            <div style={!pinned ? position : undefined} className={classes.root}>
                                <Slide direction="right" in={open}>
                                    <div className={cx(classes.inner, { [classes.unpinned]: !pinned })} data-test="filters">
                                        {toolbar}
                                        {children}
                                    </div>
                                </Slide>
                            </div>
                        </ClickAwayListener>
                    </Transition>
                </Portal>
            )}
        </>
    )
}
