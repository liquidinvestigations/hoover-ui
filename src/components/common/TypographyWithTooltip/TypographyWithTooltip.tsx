import { Tooltip, Typography } from '@mui/material'

import { ELLIPSIS_TERM_LENGTH } from '../../../constants/general'

import { TypographyWithTooltipProps } from './TypographyWithTooltip.types'

export const TypographyWithTooltip = ({ value, maxCharacters = ELLIPSIS_TERM_LENGTH }: TypographyWithTooltipProps) => (
    <Tooltip title={value} disableHoverListener={value.length < maxCharacters}>
        <Typography noWrap maxWidth={`${maxCharacters}ch`}>
            {value}
        </Typography>
    </Tooltip>
)
