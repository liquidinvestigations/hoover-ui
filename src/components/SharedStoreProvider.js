import React, { createContext, useContext } from 'react'

const Context = createContext(null)

export default function SharedStoreProvider({ children, store }) {
    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    )
}

export const useSharedStore = () => useContext(Context)
