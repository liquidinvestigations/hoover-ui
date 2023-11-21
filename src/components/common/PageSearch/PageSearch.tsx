import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Chip, Grid, IconButton, InputAdornment, TextField } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { useSharedStore } from '../../SharedStoreProvider'
import { Loading } from '../Loading/Loading'

import { useStyles } from './PageSearch.styles'
import { usePageSearch } from './usePageSearch'

export const PageSearch = observer(() => {
    const { handleInputChange, handleClearInput, handleChipClick, loadingPercentage, estimatedLoadingTimeLeft, hasSearchResults } = usePageSearch()
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        searchStore: { query },
        documentStore: {
            documentSearchStore: {
                activeSearch,
                inputValue,
                pdfSearchStore: { loading },
            },
        },
    } = useSharedStore()

    return (
        <Grid container>
            <Grid item className={classes.chipContainer}>
                {query?.q
                    .split(' ')
                    .map((chip) => (
                        <Chip
                            size="small"
                            className={classes.chip}
                            key={chip}
                            variant="outlined"
                            onClick={() => handleChipClick(chip)}
                            label={chip}
                            clickable
                            disabled={inputValue.includes(chip)}
                        />
                    ))}
            </Grid>
            <Grid item flex={1}>
                <TextField
                    autoComplete="off"
                    sx={{ display: 'block' }}
                    id="standard-basic"
                    variant="standard"
                    className={classes.input}
                    type="text"
                    placeholder={t('search_placeholder', 'Search...')}
                    value={inputValue}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" className={classes.startAdornment}>
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {inputValue && inputValue.length >= 3 && loading && !!loadingPercentage && loadingPercentage <= 100 && (
                                    <Box className={classes.adornment}>
                                        <Loading
                                            size={18}
                                            variant={loadingPercentage > 0 ? 'determinate' : 'indeterminate'}
                                            value={loadingPercentage}
                                        />
                                        {estimatedLoadingTimeLeft} | {loadingPercentage}%
                                    </Box>
                                )}
                                {hasSearchResults && (
                                    <Box className={classes.adornment}>
                                        {activeSearch.getCurrentHighlightIndex() + 1} of {activeSearch.getSearchResultsCount()}
                                    </Box>
                                )}
                                {inputValue && (
                                    <IconButton onClick={handleClearInput}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                                {hasSearchResults && (
                                    <>
                                        <IconButton onClick={activeSearch.nextSearchResult}>
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton onClick={activeSearch.previousSearchResult}>
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
        </Grid>
    )
})
