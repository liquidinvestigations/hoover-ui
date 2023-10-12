import { FormatIcu } from '@tolgee/format-icu'
import { Tolgee, TolgeeProvider, DevTools, useTolgeeSSR } from '@tolgee/react'

type Props = {
    language: string
    locales: any
}

const tolgee = Tolgee()
    .use(FormatIcu())
    .use(DevTools())
    .init({
        availableLanguages: ['en', 'fr', 'de', 'ar', 'pl', 'zh'],
        defaultLanguage: 'en',
        staticData: {
            ar: () => import('./i18n/ar.json'),
            de: () => import('./i18n/de.json'),
            en: () => import('./i18n/en.json'),
            es: () => import('./i18n/es.json'),
            fr: () => import('./i18n/fr.json'),
            he: () => import('./i18n/he.json'),
            hi: () => import('./i18n/hi.json'),
            pl: () => import('./i18n/pl.json'),
            pt: () => import('./i18n/pt.json'),
            zh: () => import('./i18n/zh.json'),
        },
    })

export const TolgeeNextProvider = ({ language, locales, children }: React.PropsWithChildren<Props>) => {
    const tolgeeSSR = useTolgeeSSR(tolgee, language, locales)

    return (
        <TolgeeProvider tolgee={tolgeeSSR} fallback="Loading..." options={{ useSuspense: true }}>
            {children}
        </TolgeeProvider>
    )
}
