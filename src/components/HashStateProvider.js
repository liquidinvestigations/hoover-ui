import qs from 'qs'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { rollupParams, unwindParams } from '../queryUtils'

const HashStateContext = createContext({})

export default function HashStateProvider({ children }) {
    const [ hashState, setHashStateInternal ] = useState()
    const hashString = typeof window !== 'undefined' && window.location.hash.substring(1) || ''

    useEffect(() => {
        setHashStateInternal(unwindParams(qs.parse(hashString)))
    }, [hashString])

    const setHashState = useCallback((stateParams, pushHistory = true) => {
        const newHashState = {...hashState, ...stateParams}
        setHashStateInternal(newHashState)
        const newHash = qs.stringify(rollupParams(newHashState))
        if (pushHistory) {
            location.hash = newHash
        } else {
            history.replaceState(undefined, undefined, `#${newHash}`)
        }
    }, [hashState])

    const initialHashState = hashString ? unwindParams(qs.parse(hashString)) : null

    return (
        <HashStateContext.Provider value={{ hashState: hashState || initialHashState, setHashState }}>
            {children}
        </HashStateContext.Provider>
    )
}

export const useHashState = () => useContext(HashStateContext)
