import { TranslationKey } from "@tolgee/react"
import '@testing-library/jest-dom'

jest.mock('node-fetch', () => ({
    __esModule: true,
    ...jest.requireActual('node-fetch'),
    default: jest.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
        }),
    ),
}))

jest.mock('@tolgee/react', () => ({
    ...jest.requireActual('@tolgee/react'),
    useTranslate: () => ({ t: (_key: TranslationKey, defaultValue?: string | undefined) => defaultValue }),
}))
