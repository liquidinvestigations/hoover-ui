import React from 'react'
import { Tab } from '@mui/material'
import { withStyles } from 'tss-react/mui'

const StyledTab = withStyles(
    Tab,
    theme => ({
        root: {
            minWidth: 80,
            '&:hover': {
                opacity: 1,
            },
        },
        wrapper: {
            flexDirection: 'row',
            '& > *:first-child': {
                marginRight: 6,
                marginBottom: '0 !important',
            }
        },
        labelIcon: {
            minHeight: 48,
        },
        textColorPrimary: {
            color: theme.palette.primary.contrastText,
        },
        selected: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default,
        },
    })
)

export default StyledTab
