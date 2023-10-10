import { Badge, Box, IconButton, Toolbar as MuiToolbar, Tooltip } from '@mui/material'
import { CSSProperties, FC, ReactElement, MouseEvent } from 'react'

import { useStyles } from './Toolbar.styles'

export interface ToolbarLink {
    icon: ReactElement
    label?: ReactElement | string
    style?: CSSProperties
    tooltip?: ReactElement | string
    disabled?: boolean
    count?: number
    onClick?: (event: MouseEvent) => void
    href?: string
    target?: string
}

interface ToolbarProps {
    links: {
        [group: string]: ToolbarLink[]
    }
}

export const Toolbar: FC<ToolbarProps> = ({ links }) => {
    const { classes } = useStyles()

    return (
        <MuiToolbar variant="dense" classes={{ root: classes.toolbar }}>
            {Object.entries(links).map(([group, links]) => (
                <Box key={group}>
                    {links.map(({ tooltip, icon, count, ...props }, index) => (
                        <Tooltip title={tooltip} key={index}>
                            <span>
                                <IconButton size="small" className={classes.toolbarIcon} {...props}>
                                    <Badge badgeContent={count} color="secondary">
                                        {icon}
                                    </Badge>
                                </IconButton>
                            </span>
                        </Tooltip>
                    ))}
                </Box>
            ))}
        </MuiToolbar>
    )
}
