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

jest.mock('@uppy/core', () => '')
jest.mock('@uppy/core', () => '')
jest.mock('@uppy/react', () => '')
jest.mock('@uppy/tus', () => '')
jest.mock('@uppy/core/dist/style.css', () => '')
jest.mock('@uppy/file-input/dist/style.css', () => '')
jest.mock('@uppy/status-bar/dist/style.css', () => '')

jest.mock('../src/index', () => ({
    router: {
        navigate: jest.fn(),
    },
}))
