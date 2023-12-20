import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    chipContainer: {
        maxWidth: '50%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        padding: `0 ${theme.spacing(1)}`,
    },
    chip: {
        color: theme.palette.grey['800'],
        borderColor: theme.palette.grey['800'],
    },
    input: {
        padding: theme.spacing(1),

        '&:focus': {
            outline: 'none',
        },

        '& fieldset': {
            border: 'none',
        },

        '& svg': {
            color: theme.palette.grey['800'],
        },

        '& input': {
            color: theme.palette.grey['800'],
        },

        '& .MuiInputBase-root': {
            width: '100%',
            '::before': {
                borderBottom: `1px solid ${theme.palette.grey['800']}`,
            },

            '::after': {
                borderBottom: `1px solid ${theme.palette.grey['800']}`,
            },

            ':hover:not(.Mui-disabled):before': {
                borderBottom: `1px solid ${theme.palette.grey['800']}`,
            },
        },
    },
    startAdornment: {
        '&>div': {
            padding: 0,
        },
    },
    adornment: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.palette.grey['800'],
        padding: `0 ${theme.spacing(1)}`,
        borderRadius: '25px',
        marginRight: theme.spacing(1),
        backgroundColor: theme.palette.primary.light,

        '&>div': {
            padding: 0,
            paddingRight: theme.spacing(1),
            height: '18px',
        },
    },
}))
