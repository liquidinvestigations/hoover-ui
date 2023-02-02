import { Theme } from '@mui/material'
import { CSSProperties, FC, ReactNode } from 'react'
import SplitPane, { Size } from 'react-split-pane'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => ({
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
        },
    },
}))

interface SplitPaneLayoutProps {
    left?: ReactNode
    right?: ReactNode
    children: ReactNode | ReactNode[]
    onLeftChange?: (newSize: number) => void
    onMiddleChange?: (newSize: number) => void
    leftSize?: Size
    leftMinSize?: Size
    leftStyle?: CSSProperties
    leftResizerStyle?: CSSProperties
    className?: string
    defaultSizeLeft: string
    defaultSizeMiddle: string
    container: boolean
}

export const SplitPaneLayout: FC<SplitPaneLayoutProps> = ({
    left,
    right,
    children,
    onLeftChange,
    onMiddleChange,
    leftSize,
    leftMinSize,
    leftStyle,
    leftResizerStyle,
    className,
    defaultSizeLeft = '20%',
    defaultSizeMiddle = '60%',
    container = true,
}) => {
    const { classes, cx } = useStyles()

    return (
        <div className={container ? cx(classes.container, className) : className}>
            {left ? (
                <SplitPane
                    key="left"
                    split="vertical"
                    size={leftSize}
                    minSize={leftMinSize}
                    pane1Style={leftStyle}
                    resizerStyle={leftResizerStyle}
                    defaultSize={defaultSizeLeft}
                    allowResize
                    onChange={onLeftChange}
                    pane1ClassName={classes.left}
                    pane2ClassName={right ? undefined : classes.middle}>
                    {left}
                    {right ? (
                        <SplitPane
                            split="vertical"
                            defaultSize={defaultSizeMiddle}
                            allowResize
                            onChange={onMiddleChange}
                            pane1ClassName={classes.middle}
                            pane2ClassName={classes.right}>
                            {children}
                            {right}
                        </SplitPane>
                    ) : (
                        children
                    )}
                </SplitPane>
            ) : right ? (
                <SplitPane
                    key="middle"
                    split="vertical"
                    defaultSize={defaultSizeMiddle}
                    allowResize
                    onChange={onMiddleChange}
                    pane1ClassName={classes.middle}
                    pane2ClassName={classes.right}>
                    {children}
                    {right}
                </SplitPane>
            ) : (
                children
            )}
        </div>
    )
}
