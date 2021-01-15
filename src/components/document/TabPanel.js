import React, { memo } from 'react'
import { Box } from '@material-ui/core'

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-force-tabpanel-${index}`}
        aria-labelledby={`scrollable-force-tab-${index}`}
        {...other}
    >
        {value === index && (
            <Box p={2}>
                {children}
            </Box>
        )}
    </div>
)

export default memo(TabPanel)
