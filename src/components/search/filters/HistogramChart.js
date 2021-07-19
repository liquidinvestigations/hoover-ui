import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { blue, grey } from '@material-ui/core/colors'
import { Tooltip } from '@material-ui/core'
import { formatThousands } from '../../../utils'

export default function HistogramChart({ width, height, axisHeight, data, selected, onSelect, onClick, preserveDragArea }) {
    const ref = useRef()

    const [startDragPosition, setStartDragPosition] = useState(null)
    const [currentDragPosition, setCurrentDragPosition] = useState(null)

    useEffect(() => {
        if (preserveDragArea === false) {
            setStartDragPosition(null)
        }
    }, [preserveDragArea])

    const getChartPosition = position => {
        const chartRect = ref.current.getBoundingClientRect()
        const chartScale = width / (chartRect.right - chartRect.left)
        return (position - chartRect.left) * chartScale
    }

    const handleBarClick = bar => event => {
        if (onSelect) {
            onSelect(event, [bar])
        } else if (onClick) {
            onClick(event, bar)
        }
    }

    const handleMouseMove = useCallback(event => {
        event.preventDefault()
        setCurrentDragPosition(getChartPosition(event.clientX))
    }, [])

    const handleMouseUp = startDragPosition => event => {
        event.preventDefault()
        window.removeEventListener('mousemove', handleMouseMove)

        const endDragPosition = getChartPosition(event.clientX)
        const startPosition = Math.min(startDragPosition, endDragPosition)
        const selectionWidth = Math.abs(startDragPosition - endDragPosition)

        const selected = data?.filter(({ barPosition, barWidth }) => (
            barPosition + barWidth >= startPosition && barPosition <= startPosition + selectionWidth
        )).map(({value}) => value)

        if (selected.length) {
            onSelect(event, selected)
        } else {
            setStartDragPosition(null)
        }
    }

    const handleMouseDown = event => {
        event.preventDefault()

        if (onSelect) {
            const position = getChartPosition(event.clientX)
            setStartDragPosition(position)
            setCurrentDragPosition(position)

            window.addEventListener('mouseup', handleMouseUp(position), {once: true})
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
            {data?.map(({label, value, count, barWidth, barHeight, barPosition, labelPosition}, index) =>
                <Fragment key={index}>
                    <text
                        className={cn('label', { selected: selected?.includes(value) })}
                        x={labelPosition}
                        y={height - axisHeight / 2}
                        transform={`rotate(-45, ${labelPosition}, ${height - axisHeight / 2})`}
                        onClick={handleBarClick(value)}
                    >
                        {label}
                    </text>
                    <Tooltip
                        placement="top"
                        title={<>{label}: <strong>{formatThousands(count)}</strong></>}
                    >
                        <rect
                            x={barPosition}
                            y={height - axisHeight - barHeight}
                            width={barWidth}
                            height={barHeight}
                            className={cn('bar', { selected: selected?.includes(value) })}
                            onClick={handleBarClick(value)}
                        />
                    </Tooltip>
                </Fragment>
            )}
            {startDragPosition && (
                <rect
                    className="selection"
                    x={Math.min(startDragPosition, currentDragPosition)}
                    y={0}
                    width={Math.abs(startDragPosition - currentDragPosition)}
                    height={height - axisHeight}
                />
            )}
        </svg>
    )
}
