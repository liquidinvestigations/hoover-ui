import '../styles/main.css'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { AppProps } from 'next/app'

import { Layout } from '../src/components/Layout'
import { SharedStoreProvider } from '../src/components/SharedStoreProvider'
import customTheme from '../src/theme'
import { TolgeeNextProvider } from '../src/tolgeeNext'

export default function HooverApp({ Component, pageProps }: AppProps) {
    return (
        <TolgeeNextProvider locales={pageProps.locales}>
            <CacheProvider value={createCache({ key: 'css', prepend: true })}>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <ThemeProvider theme={customTheme}>
                        <CssBaseline />
                        <SharedStoreProvider>
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </SharedStoreProvider>
                    </ThemeProvider>
                </LocalizationProvider>
            </CacheProvider>
        </TolgeeNextProvider>
    )
}
