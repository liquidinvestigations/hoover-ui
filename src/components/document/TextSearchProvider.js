import React, { createContext, createRef, useContext, useEffect, useState } from 'react'
import { useDocument } from './DocumentProvider'
import { debounce } from '../../utils'
import { MAX_FIND_HIGHLIGHTS } from '../../constants/general'

const TextSearchContext = createContext({})

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const nthIndex = (str, pat, n, matchCase) => {
    const L = str.length
    const lowerStr = str.toLowerCase()
    let i = -1
    while (n-- && i++ < L) {
        i = matchCase ? str.indexOf(pat, i) : lowerStr.indexOf(pat.toLowerCase(), i)
        if (i < 0){
            break
        }
    }
    return i
}

export function TextSearchProvider({children}) {
    const { pathname } = useDocument()
    const [searchOpen, setSearchOpen] = useState(false)

    const [searchText, setSearchText] = useState('')
    const [searchMatchCase, setSearchMatchCase] = useState(false)
    const [searchResultsRefs, setSearchResultsRefs] = useState([])
    const [searchResultsCount, setSearchResultsCount] = useState(0)
    const [currentSearchResult, setCurrentSearchResult] = useState(0)

    const [changed, setChanged] = useState(true)

    useEffect(() => {
        setChanged(true)
        setSearchResultsRefs([])
        setCurrentSearchResult(0)
    }, [searchText, searchMatchCase])

    useEffect(() => {
        if (resultsCount >= MAX_FIND_HIGHLIGHTS) {
            searchResultsRefs[resultsCount]?.current?.scrollIntoView()
        } else {
            searchResultsRefs[currentSearchResult]?.current?.scrollIntoView()
        }
    }, [currentSearchResult])

    useEffect(() => {
        setChanged(true)
        setSearchOpen(false)
        setSearchResultsCount(0)
        setCurrentSearchResult(0)
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
        debounce(() => setSearchText(event.target.value), 300)()
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

    const updateState = () => {
        if (changed) {
            setTimeout(() => {
                setChanged(false)
                setSearchResultsCount(resultsCount)
                setSearchResultsRefs(tempResultRefs)
            })
        }
    }

    const highlight = text => {
        if (searchOpen && searchText.length) {
            let miniWords = text.split(splitPattern)
            resultsCount += (text.match(splitPattern) || []).length

            const exceedsMaxHighlights = resultsCount >= MAX_FIND_HIGHLIGHTS

            if (exceedsMaxHighlights) {
                const position = nthIndex(text, searchText, currentSearchResult + 1, searchMatchCase)
                miniWords = [
                    text.substr(0, position),
                    text.substr(position, searchText.length),
                    text.substr(position + searchText.length)
                ]
            }

            const html = []
            miniWords.forEach((miniWord, index) => {
                if (searchMatchCase ? miniWord === searchText : miniWord.toLowerCase() === searchText.toLowerCase()) {
                    const resultRef = searchResultsRefs[resultIndex] || createRef()
                    if (!searchResultsRefs[resultIndex]) {
                        tempResultRefs[resultIndex] = resultRef
                    }
                    html.push(
                        <mark
                            key={index}
                            ref={resultRef}
                            className={resultIndex === currentSearchResult || exceedsMaxHighlights ? 'current' : null}
                            onClick={exceedsMaxHighlights ? null : (function (index) {
                                return () => setCurrentSearchResult(index)
                            })(resultIndex)}
                        >
                            {miniWord}
                        </mark>
                    )
                    resultIndex++
                } else {
                    html.push(<span key={index}>{miniWord}</span>)
                }
            })

            updateState()
            return html
        }

        updateState()
        return text
    }

    useEffect(() => {
        setSearchResultsCount(resultsCount)
        setSearchResultsRefs(tempResultRefs)
    }, [resultsCount])

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
