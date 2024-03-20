import { Box } from '@mui/material'
import { FC } from 'react'

import { useStyles } from './TabPanel.styles'
import { TabPanelProps } from './TabPanel.types'

export const TabPanel: FC<TabPanelProps> = ({ children, value, index, padding = 2 }) => {
    const { classes } = useStyles({ isHidden: index !== value, padding })

    return <Box className={classes.root}>{children}</Box>
}
