import React, { cloneElement, useEffect, useMemo, useRef, useState } from 'react'
import Router from 'next/router'
import { makeStyles } from '@mui/styles'
import { Button, FormControl, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material'
import { useProgressIndicator } from '../ProgressIndicator'
import { useSearch } from './SearchProvider'
import HotKeys from './HotKeys'
import SearchResults from './Results'
import QueryChips from './QueryChips'
import Categories from './filters/Categories'
import FiltersChips from './filters/FiltersChips'
import Histogram from './filters/Histogram'
import { DEFAULT_MAX_RESULTS } from '../../constants/general'
import SortingChips from './sorting/SortingChips'
import SortingMenu from './sorting/SortingMenu'
import { DocumentProvider } from '../document/DocumentProvider'
import SplitPaneLayout from '../SplitPaneLayout'
import Document from '../document/Document'
import { tooltips } from '../../constants/help'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles(theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    clear: {
        color: theme.palette.grey.A100,
    },
    help: {
        color: theme.palette.grey.A100,
    },
    noMaxWidth: {
        maxWidth: 'none',
    },
    info: {
        color: theme.palette.grey.A700,
    },
    sorting: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'flex-end',
    },
}))

export default function Search({ collections }) {
    const classes = useStyles()
    const inputRef = useRef()
    const { query, error, search, searchText, setSearchText, resultsLoading,
        clearResults, selectedDocData, previewNextDoc, previewPreviousDoc } = useSearch()

    const clearInput = () => {
        setSearchText('')
        inputRef.current.focus()
    }

    const clearSearchResults = url => {
        if (url === '/') {
            clearInput()
            clearResults()
            setOpenCategory('collections')
        }
    }
    useEffect(() => {
        Router.events.on('routeChangeStart', clearSearchResults)
        return () => {
            Router.events.off('routeChangeStart', clearSearchResults)
        }
    }, [clearSearchResults])

    const { setLoading } = useProgressIndicator()
    useEffect(() => {
        setLoading(resultsLoading)
    }, [resultsLoading, setLoading])

    const maxResultsCount = useMemo(() => collections
            .filter(collection => query.collections?.includes(collection.name))
            .reduce((accumulator, collection) => {
                if (!isNaN(collection.max_result_window) && collection.max_result_window < accumulator) {
                    return collection.max_result_window
                }
                return accumulator
            }, DEFAULT_MAX_RESULTS),
        [collections, query]
    )

    const handleSubmit = event => {
        event.preventDefault()
        search({ page: 1 })
    }

    const handleInputKey = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    const handleInputChange = event => {
        setSearchText(event.target.value)
    }

    const drawerRef = useRef()
    const [drawerWidth, setDrawerWidth] = useState()
    const [drawerPinned, setDrawerPinned] = useState(true)
    const [openCategory, setOpenCategory] = useState('collections')

    return (
        <DocumentProvider
            id={selectedDocData?.i}
            collection={selectedDocData?.c}
            collections={collections}
        >
            <HotKeys inputRef={inputRef}>
                <Grid container>
                    <Categories
                        collections={collections}
                        openCategory={openCategory}
                        setOpenCategory={setOpenCategory}
                        drawerRef={drawerRef}
                        drawerWidth={drawerWidth}
                        setDrawerWidth={setDrawerWidth}
                        drawerPinned={drawerPinned}
                        setDrawerPinned={setDrawerPinned}
                    />

                    <Grid item style={{ flex: 1 }}>
                        <SplitPaneLayout
                            left={
                                drawerPinned && <div ref={drawerRef} />
                            }
                            onLeftChange={size => setDrawerWidth(size)}
                            defaultSizeLeft={drawerWidth}
                            right={
                                <Document
                                    onPrev={previewPreviousDoc}
                                    onNext={previewNextDoc}
                                />
                            }
                        >
                            <div className={classes.main} ref={!drawerPinned ? drawerRef : undefined}>
                                <Grid container>
                                    <Grid item sm={12}>
                                        <form onSubmit={handleSubmit}>
                                            <Grid container justifyContent="space-between" alignItems="flex-end">
                                                <Grid item style={{ flex: 1 }}>
                                                    <TextField
                                                        variant="standard"
                                                        inputRef={inputRef}
                                                        label="Search"
                                                        margin="normal"
                                                        value={searchText}
                                                        onKeyDown={handleInputKey}
                                                        onChange={handleInputChange}
                                                        autoFocus
                                                        fullWidth
                                                        multiline
                                                        InputProps={{ endAdornment:
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={clearInput} size="small">
                                                                    {cloneElement(reactIcons.cancel, { className: classes.clear })}
                                                                </IconButton>
                                                            </InputAdornment>,
                                                        }} />
                                                </Grid>

                                                <Grid item style={{ marginLeft: 20, marginBottom: 7 }}>
                                                    <Tooltip
                                                        interactive
                                                        classes={{ tooltip: classes.noMaxWidth }}
                                                        title={tooltips.search}
                                                    >
                                                        {React.cloneElement(reactIcons.help, { className: classes.help })}
                                                    </Tooltip>
                                                </Grid>

                                                <Grid item style={{ marginLeft: 20 }}>
                                                    <FormControl variant="standard" margin="normal">
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            type="submit"
                                                            size="large"
                                                            endIcon={reactIcons.search}
                                                        >
                                                            Search
                                                        </Button>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </form>

                                        <FiltersChips />

                                        <QueryChips />

                                        <Histogram title="Date modified" field="date" />

                                        <Histogram title="Date created" field="date-created" />

                                        <div className={classes.sorting}>
                                            <SortingChips />
                                            <SortingMenu />
                                        </div>
                                    </Grid>
                                </Grid>

                                {error && <Typography color="error" className={classes.error}>{error}</Typography>}

                                <Grid container>
                                    <Grid item sm={12}>
                                        <SearchResults maxCount={maxResultsCount} />
                                    </Grid>
                                </Grid>
                            </div>
                        </SplitPaneLayout>
                    </Grid>
                </Grid>
            </HotKeys>
        </DocumentProvider>
    );
}
