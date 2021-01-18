import React, { memo } from 'react'
import { Box } from '@material-ui/core'

const TabPanel = ({ children, value, index, alwaysVisible = false, ...other }) => (
    <div
        role="tabpanel"
        hidden={!alwaysVisible && value !== index}
        {...other}
    >
        {(alwaysVisible || value === index) && (
            <Box p={2}>
                {children}
            </Box>
        )}
    </div>
)

export default memo(TabPanel)
