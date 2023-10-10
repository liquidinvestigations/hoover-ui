import '../styles/main.css'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { deDE, esES, enUS, frFR, plPL, ptBR, zhCN } from '@mui/x-date-pickers/locales'
import { AppProps } from 'next/app'

import { Layout } from '../src/components/Layout'
import { SharedStoreProvider } from '../src/components/SharedStoreProvider'
import customTheme from '../src/theme'
import { TolgeeNextProvider } from '../src/tolgeeNext'

const getLanguage = (): string => {
    let language = 'en'

    if (typeof window !== 'undefined') {
        language = localStorage.getItem('language') || language
    }

    return language
}

const getLocaleText = () => {
    switch (getLanguage()) {
        case 'de':
            return deDE.components.MuiLocalizationProvider.defaultProps.localeText

        case 'es':
            return esES.components.MuiLocalizationProvider.defaultProps.localeText

        case 'en':
            return enUS.components.MuiLocalizationProvider.defaultProps.localeText

        case 'fr':
            return frFR.components.MuiLocalizationProvider.defaultProps.localeText

        case 'pl':
            return plPL.components.MuiLocalizationProvider.defaultProps.localeText

        case 'pt':
            return ptBR.components.MuiLocalizationProvider.defaultProps.localeText

        case 'zh':
            return zhCN.components.MuiLocalizationProvider.defaultProps.localeText
    }
}

export default function HooverApp({ Component, pageProps }: AppProps) {
    return (
        <TolgeeNextProvider locales={pageProps.locales} language={getLanguage()}>
            <CacheProvider value={createCache({ key: 'css', prepend: true })}>
                <LocalizationProvider dateAdapter={AdapterLuxon} localeText={getLocaleText()} adapterLocale={getLanguage()}>
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
