import React from 'react'
import { Tab } from '@mui/material'
import { withStyles } from 'tss-react/mui'

const StyledTab = withStyles(
    Tab,
    theme => ({
        labelIcon: {
            minHeight: 48,
        },
        selected: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default,
        },
    })
)

export default StyledTab
