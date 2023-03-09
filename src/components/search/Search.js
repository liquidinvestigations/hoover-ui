import { Button, FormControl, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { observer } from 'mobx-react-lite'
import Router from 'next/router'
import { cloneElement, useEffect } from 'react'

import { tooltips } from '../../constants/help'
import { reactIcons } from '../../constants/icons'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import { Document } from '../document/Document'
import { TagsProvider } from '../document/TagsProvider'
import { useProgressIndicator } from '../ProgressIndicator'
import { useSharedStore } from '../SharedStoreProvider'

import { Categories } from './filters/Categories/Categories'
import FiltersChips from './filters/FiltersChips'
import Histogram from './filters/Histogram'
import { HotKeys } from './HotKeys'
import { QueryChips } from './QueryChips'
import { Results } from './results/Results/Results'
import { SortingChips } from './sorting/SortingChips/SortingChips'
import { SortingMenu } from './sorting/SortingMenu/SortingMenu'

const useStyles = makeStyles((theme) => ({
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

export const Search = observer(() => {
    const classes = useStyles()
    const {
        searchStore: {
            search,
            searchViewStore: {
                inputRef,
                setDrawerRef,
                drawerWidth,
                setDrawerWidth,
                drawerPinned,
                setOpenCategory,
                searchText,
                clearSearchText,
                handleInputChange,
            },
            searchResultsStore: { error, clearResults, resultsLoading, previewNextDoc, previewPreviousDoc },
        },
    } = useSharedStore()

    const clearInput = () => {
        clearSearchText()
        inputRef.current.focus()
    }

    const clearSearchResults = (url) => {
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
    })

    const { setLoading } = useProgressIndicator()
    useEffect(() => {
        setLoading(resultsLoading)
    }, [resultsLoading, setLoading])

    const handleSubmit = (event) => {
        event.preventDefault()
        search()
    }

    const handleInputKey = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    return (
        <HotKeys>
            <Grid container>
                <Categories />

                <Grid item style={{ flex: 1 }}>
                    <SplitPaneLayout
                        left={drawerPinned && <div ref={setDrawerRef} />}
                        onLeftChange={(size) => setDrawerWidth(size)}
                        defaultSizeLeft={drawerWidth}
                        right={
                            <TagsProvider>
                                <Document onPrev={previewPreviousDoc} onNext={previewNextDoc} />
                            </TagsProvider>
                        }>
                        <div className={classes.main} ref={drawerPinned ? undefined : setDrawerRef}>
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
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={clearInput} size="small">
                                                                    {cloneElement(reactIcons.cancel, { className: classes.clear })}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item style={{ marginLeft: 20, marginBottom: 7 }}>
                                                <Tooltip interactive="true" classes={{ tooltip: classes.noMaxWidth }} title={tooltips.search}>
                                                    {cloneElement(reactIcons.help, { className: classes.help })}
                                                </Tooltip>
                                            </Grid>

                                            <Grid item style={{ marginLeft: 20 }}>
                                                <FormControl variant="standard" margin="normal">
                                                    <Button variant="contained" color="primary" type="submit" size="large" endIcon={reactIcons.search}>
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

                            {error && (
                                <Typography color="error" className={classes.error}>
                                    {error}
                                </Typography>
                            )}

                            <Grid container>
                                <Grid item sm={12}>
                                    <Results />
                                </Grid>
                            </Grid>
                        </div>
                    </SplitPaneLayout>
                </Grid>
            </Grid>
        </HotKeys>
    )
})
