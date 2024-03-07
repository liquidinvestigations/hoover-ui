import { render } from "@testing-library/react"
import { Tolgee, TolgeeProvider } from "@tolgee/react"
import { ReactElement } from "react"

import { SharedStoreProvider } from "../src/components/SharedStoreProvider"

const tolgee = Tolgee().init({ defaultLanguage: 'en' })

export const renderWithProviders = (children: ReactElement) =>
    render(
        <TolgeeProvider tolgee={tolgee}>
            <SharedStoreProvider>{children}</SharedStoreProvider>
        </TolgeeProvider>,
    )