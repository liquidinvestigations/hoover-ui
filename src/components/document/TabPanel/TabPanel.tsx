import { Box, Typography } from '@mui/material'
import { FC, ReactElement, ReactNode } from 'react'

import { useStyles } from './TabPanel.styles'

interface TabPanelProps {
    children: ReactNode | ReactNode[]
    value: number
    index: number
    padding?: number
    alwaysVisible?: boolean
    name?: string | ReactElement
}

export const TabPanel: FC<TabPanelProps> = ({ children, value, index, padding = 2, alwaysVisible, name }) => {
    const { classes } = useStyles({ isHidden: index !== value, padding })

    return (
        <Box className={classes.root}>
            {alwaysVisible && (
                <Typography variant="h5" className={classes.printTitle}>
                    {name}
                </Typography>
            )}
            {children}
        </Box>
    )
}
