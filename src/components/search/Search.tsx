import { Button, FormControl, Grid, IconButton, InputAdornment, Snackbar, TextField, Tooltip, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Router from 'next/router'
import { cloneElement, FC, FormEvent, KeyboardEvent, useEffect, useRef } from 'react'

import { tooltips } from '../../constants/help'
import { reactIcons } from '../../constants/icons'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import { Document } from '../document/Document'
import { useSharedStore } from '../SharedStoreProvider'

import { QueryChips } from './chips/QueryChips/QueryChips'
import { Categories } from './filters/Categories/Categories'
import { FiltersChips } from './filters/FiltersChips/FiltersChips'
import { Histogram } from './filters/Histogram/Histogram'
import { HotKeys } from './HotKeys'
import { Results } from './results/Results/Results'
import { useStyles } from './Search.styles'

export const Search: FC = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const inputRef = useRef<HTMLInputElement>(null)
    const {
        searchStore: {
            search,
            searchViewStore: {
                setInputRef,
                setDrawerRef,
                drawerWidth,
                setDrawerWidth,
                middleColumnWidth,
                setMiddleColumnWidth,
                drawerPinned,
                setOpenCategory,
                searchText,
                clearSearchText,
                handleInputChange,
                snackbarMessage,
                handleSnackbarClose,
                showDateInsights,
            },
            searchResultsStore: { error, clearResults },
        },
    } = useSharedStore()

    const clearInput = () => {
        clearSearchText()
        inputRef?.current?.focus()
    }

    const clearSearchResults = (url: string) => {
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

    useEffect(() => {
        setInputRef(inputRef)
    }, [inputRef, setInputRef])

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        search()
    }

    const handleInputKey = (event: KeyboardEvent) => {
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
                        defaultSizeLeft={drawerWidth}
                        defaultSizeMiddle={middleColumnWidth}
                        left={drawerPinned && <div ref={setDrawerRef} />}
                        onLeftChange={setDrawerWidth}
                        onMiddleChange={setMiddleColumnWidth}
                        right={<Document />}>
                        <div className={classes.main} ref={drawerPinned ? undefined : setDrawerRef}>
                            <Grid container>
                                <Grid item sm={12}>
                                    <form onSubmit={handleSubmit}>
                                        <Grid container justifyContent="space-between" alignItems="flex-end">
                                            <Grid item style={{ flex: 1 }}>
                                                <TextField
                                                    variant="standard"
                                                    inputRef={inputRef}
                                                    label={t('search_button', 'Search')}
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
                                                <Tooltip classes={{ tooltip: classes.noMaxWidth }} title={tooltips.search}>
                                                    {cloneElement(reactIcons.help, { className: classes.help })}
                                                </Tooltip>
                                            </Grid>

                                            <Grid item style={{ marginLeft: 20 }}>
                                                <FormControl variant="standard" margin="normal">
                                                    <Button variant="contained" color="primary" type="submit" size="large" endIcon={reactIcons.search}>
                                                        <T keyName="search_button">Search</T>
                                                    </Button>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </form>
                                    <FiltersChips />
                                    <QueryChips />
                                    {showDateInsights && (
                                        <>
                                            <Histogram title={t('date-modified', 'Date modified')} field="date" />
                                            <Histogram title={t('date-created', 'Date created')} field="date-created" />
                                        </>
                                    )}
                                </Grid>
                            </Grid>

                            {!!Object.keys(error).length && (
                                <Typography color="error" className={classes.error}>
                                    {JSON.stringify(error)}
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
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={Boolean(snackbarMessage)}
                autoHideDuration={30000}
                onClose={handleSnackbarClose}
                message={
                    <Button
                        color="inherit"
                        startIcon={reactIcons.refresh}
                        onClick={() => {
                            handleSnackbarClose()
                            search()
                        }}>
                        {snackbarMessage}
                    </Button>
                }
                ClickAwayListenerProps={{
                    mouseEvent: false,
                    touchEvent: false,
                }}
                action={
                    <IconButton aria-label="close" color="inherit" className={classes.close} onClick={handleSnackbarClose} size="large">
                        {reactIcons.close}
                    </IconButton>
                }
            />
        </HotKeys>
    )
})
