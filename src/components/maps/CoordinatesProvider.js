import { createContext, useContext, useState } from 'react'

const CoordinatesContext = createContext({})

export function CoordinatesProvider({ children }) {
    const [coordinates, setCoordinates] = useState({
        latitude: 50.06676,
        longitude: 19.94633,
        zoom: 14.49,
    })

    return (
        <CoordinatesContext.Provider
            value={{
                coordinates,
                setCoordinates,
            }}>
            {children}
        </CoordinatesContext.Provider>
    )
}

export const useCoordinates = () => useContext(CoordinatesContext)
