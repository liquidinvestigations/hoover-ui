import React, { memo } from 'react'
import SplitPane from 'react-split-pane'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    left: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    right: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    middle: {
        backgroundColor: theme.palette.background.default,
        minWidth: 0, // So the Typography noWrap works
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    container: {
        overflow: 'hidden',
        height: 'calc(100vh - 56px)',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        }
    },
}))

function SplitPaneLayout({ left, children, right,  defaultSizeLeft = '20%',
                             defaultSizeMiddle = '60%', container = true, } = {}) {

    const classes = useStyles()

    if (!left || !children) {
        return null
    }

    return (
        <div className={container ? classes.container : null}>
            <SplitPane
                split="vertical"
                defaultSize={defaultSizeLeft}
                allowResize
                pane1ClassName={classes.left}
                pane2ClassName={right ? null : classes.middle}
            >
                {left}
                {right ? (
                    <SplitPane
                        split="vertical"
                        defaultSize={defaultSizeMiddle}
                        allowResize
                        pane1ClassName={classes.middle}
                        pane2ClassName={classes.right}
                    >
                        {children}
                        {right}
                    </SplitPane>
                ) : (children)}
            </SplitPane>
        </div>
    )
}

export default memo(SplitPaneLayout)
