import React from 'react'
import { Tab } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const StyledTab = withStyles((theme) => ({
    root: {
        minWidth: 80,
        '&:hover': {
            opacity: 1,
        },
        '&$selected': {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default,
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
    selected: {},
}))((props) => <Tab {...props} />)

export default StyledTab
