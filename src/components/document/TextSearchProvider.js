import React, { createContext, useContext, useState } from 'react'

const TextSearchContext = createContext({})

export function TextSearchProvider({children}) {
    const [searchOpen, setSearchOpen] = useState(false)

    const [searchText, setSearchText] = useState('')
    const [searchMatchCase, setSearchMatchCase] = useState(true)
    const [searchTextResults, setSearchTextResults] = useState([])
    const [currentSearchResult, setCurrentSearchResult] = useState(0)

    const onKeyDown = event => {
        if (event.key === 'Enter') {
            console.log(searchText)
        }
    }

    const onChange = event => {
        setSearchText(event.target.value)
    }

    const prevSearchResult = () => {
        if (currentSearchResult > 0) {
            setCurrentSearchResult(prev => prev - 1)
        }
    }

    const nextSearchResult = () => {
        if (currentSearchResult < searchTextResults.length - 1) {
            setCurrentSearchResult(prev => prev + 1)
        }
    }

    return (
        <TextSearchContext.Provider value={{
            searchOpen, setSearchOpen,
            searchText, onKeyDown, onChange,
            searchMatchCase, setSearchMatchCase,
            searchTextResults, setSearchTextResults,
            currentSearchResult, setCurrentSearchResult,
            prevSearchResult, nextSearchResult,
        }}>
            {children}
        </TextSearchContext.Provider>
    )
}

export const useTextSearch = () => useContext(TextSearchContext)
