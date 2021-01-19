import React, { memo } from 'react'
import { Box } from '@material-ui/core'

const TabPanel = ({ children, value, index, padding = 2, alwaysVisible = false, ...other }) => (
    <div
        role="tabpanel"
        hidden={!alwaysVisible && value !== index}
        {...other}
    >
        {(alwaysVisible || value === index) && (
            <Box p={padding}>
                {children}
            </Box>
        )}
    </div>
)

export default memo(TabPanel)
