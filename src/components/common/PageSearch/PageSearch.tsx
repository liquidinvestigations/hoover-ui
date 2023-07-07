import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SearchIcon from '@mui/icons-material/Search'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './PageSearch.styles'

const PageSearchInput = () => {
    const [inputValue, setInputValue] = useState('')
    const { classes } = useStyles()
    const {
        documentStore: {
            documentSearchStore: { isOpen, setQuery, activeSearch },
        },
    } = useSharedStore()

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value)
    }

    useEffect(() => {
        setQuery(inputValue)
    }, [inputValue, setQuery])

    return (
        <TextField
            autoComplete="off"
            sx={{ display: !isOpen ? 'none' : 'block' }}
            id="standard-basic"
            variant="standard"
            className={classes.input}
            type="text"
            placeholder="Search..."
            value={inputValue}
            onChange={handleInputChange}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        {inputValue && activeSearch.getSearchResultsCount() > 0 && (
                            <SearchCount count={activeSearch.getSearchResultsCount()} currentIndex={activeSearch.getCurrentHighlightIndex()} />
                        )}
                        <IconButton onClick={activeSearch.nextSearchResult}>
                            <ArrowDownwardIcon />
                        </IconButton>
                        <IconButton onClick={activeSearch.previousSearchResult}>
                            <ArrowUpwardIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}

interface SearchCountProps {
    count: number
    currentIndex: number
}

const SearchCount: React.FC<SearchCountProps> = ({ count, currentIndex }) => {
    const { classes } = useStyles()

    return (
        <Box className={classes.searchCount}>
            {currentIndex + 1} of {count}
        </Box>
    )
}

export const PageSearch = observer(PageSearchInput)
