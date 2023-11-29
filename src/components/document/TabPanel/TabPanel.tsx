import { Box } from '@mui/material'
import { FC, ReactNode } from 'react'

import { useStyles } from './TabPanel.styles'

interface TabPanelProps {
    children: ReactNode | ReactNode[]
    value: number
    index: number
    padding?: number
    alwaysVisible?: boolean
}

export const TabPanel: FC<TabPanelProps> = ({ children, value, index, padding = 2, alwaysVisible }) => {
    const { classes } = useStyles()

    return (
        <Box padding={padding} hidden={index !== value && !alwaysVisible} className={classes.root}>
            {children}
        </Box>
    )
}
