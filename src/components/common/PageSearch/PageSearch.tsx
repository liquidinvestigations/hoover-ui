import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SearchIcon from '@mui/icons-material/Search'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './PageSearch.styles'

export const PageSearch = observer(() => {
    const { classes } = useStyles()
    const {
        documentStore: {
            documentSearchStore: { inputValue, setInputValue, activeSearch },
        },
    } = useSharedStore()

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value)
    }

    return (
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
})
