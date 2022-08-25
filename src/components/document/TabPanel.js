import React, { memo } from 'react'
import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
}))

const TabPanel = ({ children, value, index, padding = 2, alwaysVisible = false, tabClass, ...other }) => {
    const classes = useStyles()

    return (
        <div
            role="tabpanel"
            hidden={!alwaysVisible && value !== index}
            className={classes.root}
            {...other}
        >
            {(alwaysVisible || value === index) && (
                <Box p={padding} className={classes.tab}>
                    {children}
                </Box>
            )}
        </div>
    )
}

export default memo(TabPanel)
