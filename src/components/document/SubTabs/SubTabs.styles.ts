import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    printTitle: {
        margin: theme.spacing(2),
    },

    icon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    },

    subTab: {
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },

    searchCount: {
        position: 'absolute',
        top: 0,
        right: 0,

        '& > div': {
            padding: theme.spacing(0.5),
        },
    },
    chunkTabsContainer: {
        '.MuiTabs-flexContainer button': {
            paddingBottom: 0,
        },

        '&& .MuiTabs-root ': {
            minHeight: 40,
        },

        '.MuiTab-root ': {
            fontSize: '0.85em',
        },
    },

    pdfTabsContainer: {
        '.MuiTab-root ': {
            fontSize: '0.775em',
        },
    },
}))
