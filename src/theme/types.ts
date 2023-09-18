import '@mui/material/styles'

declare module '@mui/material/styles' {
    interface TypographyVariants {
        xs: React.CSSProperties
    }

    interface TypographyVariantsOptions {
        xs?: React.CSSProperties
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        xs: true
    }
}
