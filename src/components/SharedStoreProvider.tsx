import { enableStaticRendering } from 'mobx-react-lite'
import { createContext, FC, useContext } from 'react'

import { SharedStore } from '../stores/SharedStore'

enableStaticRendering(false)

let clientStore: SharedStore

export const initializeStore = () => {
    const store = clientStore ?? new SharedStore()

    if (!clientStore) clientStore = store

    return store
}

const Context = createContext<SharedStore | null>(null)

export const SharedStoreProvider: FC<{ children: React.ReactNode }> = ({ children }) => (
    <Context.Provider value={initializeStore()}>{children}</Context.Provider>
)

export const useSharedStore = () => {
    const store = useContext(Context)

    if (!store) {
        throw new Error('hook must be used within a Provider')
    }

    return store
}
