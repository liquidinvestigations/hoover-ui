import React, { createContext, useContext } from 'react'

const UserContext = createContext(null)

export default function UserProvider({ children, whoAmI }) {
    return (
        <UserContext.Provider value={whoAmI}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
