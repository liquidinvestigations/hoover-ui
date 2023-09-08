import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    chip: {
        marginLeft: theme.spacing(0.5),
        display: 'inline-block',
        padding: `0 ${theme.spacing(1)}`,
        color: theme.palette.common.white,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'color 0.3s, border-color 0.3s',
        '&:hover': {
            color: theme.palette.primary.dark,
            borderColor: theme.palette.primary.dark,
            backgroundColor: theme.palette.common.white,
        },
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
            color: theme.palette.common.white,
        },

        '& input': {
            color: theme.palette.common.white,
        },

        '& .MuiInputBase-root': {
            width: '100%',
            '::before': {
                borderBottom: `1px solid ${theme.palette.common.white}`,
            },

            '::after': {
                borderBottom: `1px solid ${theme.palette.common.white}`,
            },

            ':hover:not(.Mui-disabled):before': {
                borderBottom: `1px solid ${theme.palette.common.white}`,
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
        color: theme.palette.common.white,
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
