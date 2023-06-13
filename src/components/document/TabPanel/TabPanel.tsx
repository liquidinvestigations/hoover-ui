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

export const TabPanel: FC<TabPanelProps> = ({ children, value, index, padding = 2, alwaysVisible = false, ...other }) => {
    const { classes } = useStyles()

    return (
        <div role="tabpanel" hidden={!alwaysVisible && value !== index} className={classes.root} {...other}>
            {(alwaysVisible || value === index) && (
                <Box p={padding} className={classes.tab}>
                    {children}
                </Box>
            )}
        </div>
    )
}