import { enableStaticRendering } from 'mobx-react-lite'
import { createContext, FC, useContext } from 'react'

import { SharedStore } from '../stores/SharedStore'
import { User } from '../Types'

enableStaticRendering(typeof window === 'undefined')

let clientStore: SharedStore

export const initializeStore = (user: User) => {
    const store = clientStore ?? new SharedStore(user)

    if (typeof window === 'undefined') return store
    if (!clientStore) clientStore = store

    return store
}

const Context = createContext<SharedStore | null>(null)

export const SharedStoreProvider: FC<{ children: React.ReactNode; user: User }> = ({ children, user }) => (
    <Context.Provider value={initializeStore(user)}>{children}</Context.Provider>
)

export const useSharedStore = () => {
    const store = useContext(Context)

    if (!store) {
        throw new Error('hook must be used within a Provider')
    }

    return store
}
