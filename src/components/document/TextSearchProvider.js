import React, { createContext, createRef, useContext, useEffect, useState } from 'react'
import { useDocument } from './DocumentProvider'

const TextSearchContext = createContext({})

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function TextSearchProvider({children}) {
    const { pathname } = useDocument()
    const [searchOpen, setSearchOpen] = useState(false)

    const [searchText, setSearchText] = useState('')
    const [searchMatchCase, setSearchMatchCase] = useState(true)
    const [searchResultsRefs, setSearchResultsRefs] = useState([])
    const [searchResultsCount, setSearchResultsCount] = useState(0)
    const [currentSearchResult, setCurrentSearchResult] = useState(0)

    useEffect(() => {
        setSearchResultsRefs([])
        setSearchResultsCount(0)
        setCurrentSearchResult(0)
    }, [searchText, searchMatchCase, pathname])

    useEffect(() => {
        searchResultsRefs[currentSearchResult]?.current?.scrollIntoView()
    }, [currentSearchResult])

    useEffect(() => {
        setSearchOpen(false)
    }, [pathname])

    const onKeyDown = event => {
        if (event.key === 'Escape') {
            setSearchOpen(false)
        } else if (event.key === 'f' && event.ctrlKey) {
            event.preventDefault()
            setSearchOpen(true)
        } else if (event.key === 'Enter') {
            if (event.shiftKey) {
                prevSearchResult()
            } else {
                nextSearchResult()
            }
        }
    }

    const onChange = event => {
        setSearchText(event.target.value)
    }

    const prevSearchResult = () => {
        if (currentSearchResult > 0) {
            setCurrentSearchResult(prev => prev - 1)
        } else {
            setCurrentSearchResult(searchResultsCount - 1)
        }
    }

    const nextSearchResult = () => {
        if (currentSearchResult < searchResultsCount - 1) {
            setCurrentSearchResult(prev => prev + 1)
        } else {
            setCurrentSearchResult(0)
        }
    }

    const splitPattern = new RegExp(`(${escapeRegex(searchText)})` , searchMatchCase ? 'g' : 'gi')
    let resultsCount = 0
    let resultIndex = 0
    let tempResultRefs = []

    const highlight = text => {
        if (searchOpen && searchText.length > 1) {
            let miniWords

            if (Array.isArray(text)) {
                miniWords = text.reduce((acc, txt) => {
                    acc.push(...txt.split(splitPattern))
                    resultsCount += (txt.match(splitPattern) || []).length
                    return acc
                }, [])
            } else {
                miniWords = text.split(splitPattern)
                resultsCount += (text.match(splitPattern) || []).length
            }

            const html = []
            miniWords.forEach((miniWord, index) => {
                if (searchMatchCase ? miniWord === searchText : miniWord.toLowerCase() === searchText.toLowerCase()) {
                    const resultRef = searchResultsRefs[resultIndex] || createRef()
                    if (!searchResultsRefs[resultIndex]) {
                        tempResultRefs.push(resultRef)
                    }
                    html.push(
                        <mark
                            key={index}
                            ref={resultRef}
                            className={resultIndex === currentSearchResult ? 'current' : null}
                        >
                            {miniWord}
                        </mark>
                    )
                    resultIndex++
                } else {
                    html.push(<span key={index}>{miniWord}</span>)
                }
            })

            if (tempResultRefs.length || resultsCount === 0) {
                setTimeout(() => {
                    setSearchResultsCount(resultsCount)
                    setSearchResultsRefs(tempResultRefs)
                })
            }

            return html
        }
        setTimeout(() => {
            setSearchResultsCount(resultsCount)
            setSearchResultsRefs(tempResultRefs)
        })

        return text
    }

    return (
        <TextSearchContext.Provider value={{
            searchOpen, setSearchOpen,
            searchText, onKeyDown, onChange,
            searchMatchCase, setSearchMatchCase,
            currentSearchResult, searchResultsCount,
            prevSearchResult, nextSearchResult, highlight,
        }}>
            {children}
        </TextSearchContext.Provider>
    )
}

export const useTextSearch = () => useContext(TextSearchContext)
