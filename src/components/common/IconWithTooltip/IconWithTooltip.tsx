import { Tooltip } from '@mui/material'
import { cloneElement } from 'react'

import { getTypeIcon } from '../../../utils/utils'

import { IconWithTooltipProps } from './IconWithTooltip.types'

export const IconWithTooltip = ({ value, className }: IconWithTooltipProps) => (
    <Tooltip placement="top" title={value}>
        <span>{cloneElement(getTypeIcon(value), { className })}</span>
    </Tooltip>
)
