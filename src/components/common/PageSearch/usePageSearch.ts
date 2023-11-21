import { ChangeEvent, useEffect } from 'react'

import { formatETATime } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'

export const usePageSearch = () => {
    const {
        documentStore: {
            documentSearchStore: {
                query: documentSearchQuery,
                inputValue,
                setInputValue,
                activeSearch,
                clearQuery,
                pdfSearchStore: { estimatedTimeLeft, getLoadingPercentage },
            },
        },
    } = useSharedStore()
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value)
    }

    const handleClearInput = () => {
        setInputValue('')
        clearQuery()
    }

    useEffect(() => {
        setInputValue(documentSearchQuery)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentSearchQuery])

    const handleChipClick = (chip: string) => {
        if (inputValue && !inputValue.endsWith(' ')) {
            setInputValue(`${inputValue} ${chip}`)
        } else {
            setInputValue(chip)
        }
    }

    const loadingPercentage = getLoadingPercentage()
    const estimatedLoadingTimeLeft = formatETATime(estimatedTimeLeft)
    const hasSearchResults = !!inputValue && activeSearch && inputValue.length >= 3 && activeSearch.getSearchResultsCount() > 0

    return {
        handleInputChange,
        handleClearInput,
        handleChipClick,
        loadingPercentage,
        estimatedLoadingTimeLeft,
        hasSearchResults,
    }
}
