import { CSSProperties, FC, ReactNode } from 'react'
import SplitPane, { Size } from 'react-split-pane'

import { useStyles } from './SplitPaneLayout.styles'

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
    defaultSizeLeft?: string | number
    defaultSizeMiddle?: string | number
    container?: boolean
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

    const rightPanel = right ? (
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
    )

    return (
        <div className={container ? cx(classes.container, className) : className}>
            {left ? (
                <SplitPane
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
                    {rightPanel}
                </SplitPane>
            ) : (
                rightPanel
            )}
        </div>
    )
}
