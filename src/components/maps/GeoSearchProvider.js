import { createContext, useContext, useState } from 'react'

const GeoSearchContext = createContext({})

export function GeoSearchProvider({ children }) {
    const [results, setResults] = useState('123')

    return (
        <GeoSearchContext.Provider
            value={{
                results,
            }}>
            {children}
        </GeoSearchContext.Provider>
    )
}

export const useGeoSearch = () => useContext(GeoSearchContext)
