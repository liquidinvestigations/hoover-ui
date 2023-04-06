import { ClickAwayListener, Fade, Grid, ListItem, Portal, Slide, Typography } from '@mui/material'
import { duration } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { cloneElement, CSSProperties, FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { Transition } from 'react-transition-group'

import { reactIcons } from '../../../../constants/icons'
import { Category } from '../../../../Types'
import { ThinProgress } from '../../../common/ThinProgress/ThinProgress'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CategoryDrawer.styles'

const hasDisabledClickAway = (element: HTMLElement): boolean => {
    if (element.dataset?.disableClickAway) {
        return true
    }
    return !!element.parentNode && hasDisabledClickAway(element.parentNode as HTMLElement)
}

interface CategoryDrawerProps {
    category: Category
    title: string | JSX.Element
    icon: keyof typeof reactIcons
    children: ReactNode | ReactNode[]
    toolbar: JSX.Element
    loading?: boolean
    loadingETA?: number
    greyed?: boolean
    highlight?: boolean
}

export const CategoryDrawer: FC<CategoryDrawerProps> = observer(
    ({ category, title, icon, children, toolbar, loading, loadingETA, greyed = false, highlight = true }) => {
        const { classes, cx } = useStyles()
        const [position, setPosition] = useState<Partial<CSSProperties>>({ top: 0, left: 0, width: 100 })
        const { drawerPinned, drawerRef, drawerWidth, openCategory, setOpenCategory, wideFilters } = useSharedStore().searchStore.searchViewStore

        const updatePosition = () => {
            const clientRect = drawerRef?.getBoundingClientRect()
            const scrollTop = drawerRef?.parentElement?.scrollTop

            if (clientRect && scrollTop !== undefined) {
                setPosition({
                    top: clientRect.top + scrollTop + 'px',
                    left: clientRect.left + 'px',
                    width: drawerWidth,
                })
            }
        }

        useEffect(() => {
            if (drawerRef) {
                updatePosition()
            }
        }, [drawerRef, drawerWidth, wideFilters, drawerPinned])

        const titleBar = useMemo(
            () => (
                <ListItem
                    dense
                    button
                    data-disable-click-away
                    onClick={() => setOpenCategory(category)}
                    className={cx({ [classes.openCollapsed]: !wideFilters && openCategory === category })}>
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
                                className={cx(classes.title, { [classes.bold]: openCategory === category })}
                                color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}>
                                {title}
                            </Typography>
                        </Grid>

                        {openCategory === category && (
                            <Grid item className={classes.open}>
                                {cloneElement(reactIcons.chevronRight, { color: highlight ? 'secondary' : 'action' })}
                            </Grid>
                        )}
                    </Grid>
                </ListItem>
            ),
            [category, title, greyed, highlight, wideFilters, openCategory, setOpenCategory, loading, loadingETA]
        )

        return (
            <>
                {titleBar}

                {(!drawerPinned || (drawerPinned && drawerRef)) && (
                    <Portal container={typeof document !== 'undefined' && drawerPinned ? drawerRef : undefined}>
                        <Transition
                            in={openCategory === category}
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
                                    !drawerPinned && !hasDisabledClickAway(event.target as HTMLElement) && setOpenCategory(undefined)
                                }}
                                disableReactTree>
                                <div style={!drawerPinned ? position : undefined} className={classes.root}>
                                    <Slide direction="right" in={openCategory === category}>
                                        <div className={cx(classes.inner, { [classes.unpinned]: !drawerPinned })} data-test="filters">
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
)
