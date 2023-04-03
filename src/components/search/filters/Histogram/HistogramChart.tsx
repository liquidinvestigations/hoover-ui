import { Tooltip } from '@mui/material'
import { blue, grey } from '@mui/material/colors'
import cx from 'classnames'
import React, { FC, Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { formatThousands } from '../../../../utils/utils'

export interface HistogramBar {
    label: string
    value: string
    count: number
    barWidth: number
    barHeight: number
    barPosition: number
    labelPosition: number
}

interface HistogramChartProps {
    width: number
    height: number
    axisHeight: number
    data?: HistogramBar[]
    selected?: string[]
    onSelect?: (event: MouseEvent, bar: string[]) => void
    onClick?: (event: MouseEvent, bar: string) => void
    preserveDragArea?: boolean
}

export const HistogramChart: FC<HistogramChartProps> = ({
    width,
    height,
    axisHeight,
    data,
    onSelect,
    onClick,
    selected = [],
    preserveDragArea = false,
}) => {
    const ref = useRef<SVGSVGElement>(null)

    const [startDragPosition, setStartDragPosition] = useState<number | undefined>()
    const [currentDragPosition, setCurrentDragPosition] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (!preserveDragArea) {
            setStartDragPosition(undefined)
        }
    }, [preserveDragArea])

    const getChartPosition = (position: number) => {
        const chartRect = ref.current?.getBoundingClientRect()
        if (chartRect) {
            const chartScale = width / (chartRect.right - chartRect.left)
            return (position - chartRect.left) * chartScale
        }
        return 0
    }

    const handleBarClick = (bar: string) => (event: React.MouseEvent) => {
        if (onSelect) {
            onSelect(event.nativeEvent, [bar])
        } else if (onClick) {
            onClick(event.nativeEvent, bar)
        }
    }

    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault()
        setCurrentDragPosition(getChartPosition(event.clientX))
    }, [])

    const handleMouseUp = (startDragPosition: number) => (event: MouseEvent) => {
        event.preventDefault()
        window.removeEventListener('mousemove', handleMouseMove)

        const endDragPosition = getChartPosition(event.clientX)
        const startPosition = Math.min(startDragPosition, endDragPosition)
        const selectionWidth = Math.abs(startDragPosition - endDragPosition)

        const selected = data
            ?.filter(({ barPosition, barWidth }) => barPosition + barWidth >= startPosition && barPosition <= startPosition + selectionWidth)
            .map(({ value }) => value)

        if (onSelect && selected?.length) {
            onSelect(event, selected)
        } else {
            setStartDragPosition(undefined)
        }
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        event.preventDefault()

        if (onSelect) {
            const position = getChartPosition(event.clientX)
            setStartDragPosition(position)
            setCurrentDragPosition(position)

            window.addEventListener('mouseup', handleMouseUp(position), { once: true })
            window.addEventListener('mousemove', handleMouseMove)
        }
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" ref={ref} onMouseDown={handleMouseDown}>
            <style>{`
            svg {
                overflow: visible;
            }
            .bar {
                cursor: pointer;
                fill: ${grey[300]};
            }
            .bar.selected {
                fill: ${blue[300]};
            }
            .label {
                cursor: pointer;
                font: 5.5px sans-serif;
                text-anchor: middle;
                dominant-baseline: central;
            }
            .label.selected {
                color: ${blue[300]};
            }
            .selection {
                fill-opacity: 0.3;
                fill: ${blue[300]};
            }
        `}</style>
            {data?.map(({ label, value, count, barWidth, barHeight, barPosition, labelPosition }, index) => (
                <Fragment key={index}>
                    <text
                        className={cx('label', { selected: selected?.includes(value) })}
                        x={labelPosition}
                        y={height - axisHeight / 2}
                        transform={`rotate(-45, ${labelPosition}, ${height - axisHeight / 2})`}
                        onClick={handleBarClick(value)}>
                        {label}
                    </text>
                    <Tooltip
                        placement="top"
                        title={
                            <>
                                {label}: <strong>{formatThousands(count)}</strong>
                            </>
                        }>
                        <rect
                            x={barPosition}
                            y={height - axisHeight - barHeight}
                            width={barWidth}
                            height={barHeight}
                            className={cx('bar', { selected: selected?.includes(value) })}
                            onClick={handleBarClick(value)}
                        />
                    </Tooltip>
                </Fragment>
            ))}
            {startDragPosition && (
                <rect
                    className="selection"
                    x={Math.min(startDragPosition, currentDragPosition || 0)}
                    y={0}
                    width={Math.abs(startDragPosition - (currentDragPosition || 0))}
                    height={height - axisHeight}
                />
            )}
        </svg>
    )
}
