import { Tab } from '@mui/material'
import { withStyles } from 'tss-react/mui'

export const StyledTab = withStyles(Tab, (theme) => ({
    labelIcon: {
        minHeight: 48,
    },

    textColorPrimary: {
        color: theme.palette.primary.contrastText,
    },

    selected: {
        color: `${theme.palette.primary.contrastText} !important`,
        backgroundColor: theme.palette.background.default,
    },
}))
