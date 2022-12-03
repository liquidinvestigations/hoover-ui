import { createContext, FC, useContext } from 'react'
import { SharedStore } from '../stores/SharedStore'

const Context = createContext<SharedStore | null>(null)

export const SharedStoreProvider: FC<{ children: React.ReactNode; store: SharedStore }> = ({ children, store }) => {
    return <Context.Provider value={store}>{children}</Context.Provider>
}

export const useSharedStore = () => useContext(Context)
