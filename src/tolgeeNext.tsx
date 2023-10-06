import { FormatIcu } from '@tolgee/format-icu'
import { Tolgee, TolgeeProvider, DevTools, useTolgeeSSR, useTolgee } from '@tolgee/react'

type Props = {
    locales: any
}

const tolgee = Tolgee()
    .use(FormatIcu())
    .use(DevTools())
    .init({
        availableLanguages: ['en', 'fr', 'de', 'ar', 'pl', 'zh'],
        defaultLanguage: 'en',
        staticData: {
            en: () => import('./i18n/en.json'),
            de: () => import('./i18n/de.json'),
            ar: () => import('./i18n/ar.json'),
            fr: () => import('./i18n/fr.json'),
            pl: () => import('./i18n/pl.json'),
            zh: () => import('./i18n/zh.json'),
        },
    })

export const TolgeeNextProvider = ({ locales, children }: React.PropsWithChildren<Props>) => {
    let lang = 'en'
    if (typeof window !== 'undefined') {
        lang = localStorage.getItem('language') || lang
    }

    const tolgeeSSR = useTolgeeSSR(tolgee, lang, locales)

    return (
        <TolgeeProvider tolgee={tolgeeSSR} fallback="Loading..." options={{ useSuspense: true }}>
            {children}
        </TolgeeProvider>
    )
}
