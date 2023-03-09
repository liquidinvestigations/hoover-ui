import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    splitPane: {
        overflow: 'hidden',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',
        height: 'calc(100vh - 96px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 88px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 104px)',
        },
    },

    horizontalSplitPane: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    title: {
        height: '40px',
        padding: '10px',
        backgroundColor: theme.palette.grey['100'],
        borderBottomColor: theme.palette.grey['400'],
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
    },
}))
