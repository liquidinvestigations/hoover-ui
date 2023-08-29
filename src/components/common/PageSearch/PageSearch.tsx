import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './PageSearch.styles'

export const PageSearch = observer(() => {
    const { classes } = useStyles()
    const {
        searchStore: { query },
        documentStore: {
            documentSearchStore: { inputValue, setInputValue, activeSearch, clearQuery },
        },
    } = useSharedStore()

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value)
    }

    const handleClearInput = () => {
        setInputValue('')
        clearQuery()
    }

    const handleChipClick = (chip: string) => {
        if (inputValue && !inputValue.endsWith(' ')) {
            setInputValue(`${inputValue} ${chip}`);
        } else {
            setInputValue(chip);
        }
    }
    
    return (
        <>
            {query?.q.split(' ').filter((chip) => !inputValue.includes(chip)).map((chip) => (
                <Box key={chip} className={classes.chip} onClick={() => handleChipClick(chip)}>
                    {chip}
                </Box>
            ))}
            <TextField
                autoComplete="off"
                sx={{ display: 'block' }}
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
                                <Box className={classes.searchCount}>
                                    {activeSearch.getCurrentHighlightIndex() + 1} of {activeSearch.getSearchResultsCount()}
                                </Box>
                            )}
                            <IconButton onClick={handleClearInput}>
                                <CloseIcon />
                            </IconButton>
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
        </>
    )
})
