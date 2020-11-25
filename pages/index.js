import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, List, Typography } from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'
import ErrorBoundary from '../src/components/ErrorBoundary'
import HotKeys from '../src/components/HotKeys'
import SplitPaneLayout from '../src/components/SplitPaneLayout'
import SearchRightDrawer from '../src/components/SearchRightDrawer'
import SearchSettings from '../src/components/SearchSettings'
import SearchResults from '../src/components/SearchResults'
import Filter from '../src/components/Filter'
import CollectionsBox from '../src/components/CollectionsBox'
import Filters from '../src/components/Filters'
import { SEARCH_GUIDE, SEARCH_QUERY_PREFIXES, SORT_RELEVANCE } from '../src/constants'
import useLoading from '../src/hooks/useLoading'
import { copyMetadata } from '../src/utils'
import api from '../src/api'

const extractChips = query => {
    const chips = []
    const queryParts = query ? query.match(/(?:[^\s"\[{]+|"[^"]*"|[\[{][^\]}]*[\]}])+/g) : []
    const otherInput = []
    queryParts?.forEach(part => {
        if (part.indexOf(':') > 0) {
            const partParts = part.split(':')
            if (SEARCH_QUERY_PREFIXES.indexOf(partParts[0]) >= 0 && partParts[1].length > 0) {
                chips.push(part)
            } else {
                otherInput.push(part)
            }
        } else {
            otherInput.push(part)
        }
    })
    return [chips, otherInput.join(' ')]
}

const useStyles = makeStyles(theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    paper: {
        position: 'absolute',
        width: theme.spacing(50),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
    },
}))

export default function Index({ collections, results, error }) {
    const keys = [{
        name: 'nextItem',
        key: 'j',
        help: 'Preview next result',
        handler: () => {
            if (!isInputFocused()) {
                fetchNextDoc()
            }
        },
    },{
        name: 'previousItem',
        key: 'k',
        help: 'Preview the previous result',
        handler: () => {
            if (!isInputFocused()) {
                fetchPreviousDoc()
            }
        },
    },{
        name: 'copyMetadata',
        key: 'c',
        help: 'Copy metadata (MD5 and path) of the currently previewed item to the clipboard.',
        handler: (event, showMessage) => {
            if (isInputFocused()) {
                return
            }
            event.preventDefault()
            if (this.props.docData && this.props.docData.content) {
                showMessage(copyMetadata(this.props.docData))
            } else {
                showMessage('Unable to copy metadata – no document selected?')
            }
        },
    },{
        name: 'openItem',
        key: 'o',
        help: 'Open the currently previewed result',
        handler: () => {
            isInputFocused() || window.open(this.props.docUrl, '_blank')
        },
    },{
        name: 'focusInputField',
        key: '/',
        help: 'Focus the search field',
        handler: event => {
            if (!isInputFocused()) {
                event.preventDefault()
                inputRef && inputRef.focus()
            }
        },
    }]

    const classes = useStyles()
    const router = useRouter()
    const { query, pathname } = router

    let inputRef = null
    const setInputRef = element => inputRef = element
    const isInputFocused = () => inputRef === document.activeElement

    const [ queryChips, queryText ] = extractChips(query.q)
    const [chips, setChips] = useState(queryChips)
    const [text, setText] = useState(queryText)

    const buildQuery = ({ chips, text, size, order, page, collections }) => ({
        q: (chips.length ? chips.join(' ') + ' ' : '') + text,
        size, order, page, collections,
    })

    const search = params => {
        const defaultParams = { chips, text, size, order, page, collections: selectedCollections }
        router.push({ pathname, query: buildQuery({ ...defaultParams, ...params }) })
    }

    const [selectedCollections, setSelectedCollections] = useState(collections?.map(c => c.name))
    const handleSelectedCollectionsChange = collections => {
        setSelectedCollections(collections)
        search({ collections, page: 1 })
    }

    const [size, setSize] = useState(query.size || 10)
    const handleSizeChange = size => {
        setSize(size)
        search({ size, page: 1 })
    }

    const [order, setOrder] = useState(query.order || SORT_RELEVANCE)
    const handleOrderChange = order => {
        setOrder(order)
        search({ order, page: 1 })
    }

    const [page, setPage] = useState(query.page || 1)
    const handlePageChange = page => {
        setPage(page)
        search({ page })
    }

    const handleInputChange = event => setText(event.target.value)

    const handleBeforeChipAdd = chip => {
        if (chip.indexOf(':') > 0) {
            const chipParts = chip.split(':')
            if (SEARCH_QUERY_PREFIXES.indexOf(chipParts[0]) >= 0 && chipParts[1].length > 0) {
                return true
            }
        }
        return false
    }

    const handleChipAdd = chip => {
        setChips([...chips, chip])
        setText(text.replace(chip, ''))
    }

    const handleChipDelete = (chip, chipIndex) => {
        const chips = [...chips]
        chips.splice(chipIndex, 1)
        setChips(chips)
        search({ chips, page: 1 })
    }

    const handleSubmit = event => {
        event.preventDefault()
        search({ page: 1 })
    }

    useEffect(() => {
        const [ queryChips, queryText ] = extractChips(query.q)
        if (queryText !== text || JSON.stringify(queryChips) !== JSON.stringify(chips)) {
            setChips(queryChips)
            setText(queryText)
            search({chips: queryChips, text: queryText, page: 1})
        }
    }, [query.q])

    const loading = useLoading()

    return (
        <ErrorBoundary>
            <HotKeys keys={keys} focused>
                <SplitPaneLayout
                    left={
                        <>
                            <List dense>
                                <Filter title="Collections" colorIfFiltered={false}>
                                    <CollectionsBox
                                        collections={collections}
                                        selected={selectedCollections}
                                        changeSelection={handleSelectedCollectionsChange}
                                        counts={results?.count_by_index}
                                    />
                                </Filter>
                            </List>

                            <Filters />
                        </>
                    }
                    right={<SearchRightDrawer />}>
                    <div className={classes.main}>
                        <Grid container>
                            <Grid item sm={12}>
                                <form onSubmit={handleSubmit}>
                                    <ChipInput
                                        inputRef={setInputRef}
                                        label="Search"
                                        type="search"
                                        margin="normal"
                                        value={chips}
                                        inputValue={text}
                                        blurBehavior="ignore"
                                        dataSource={SEARCH_QUERY_PREFIXES}
                                        newChipKeyCodes={[]}
                                        newChipKeys={[]}
                                        onUpdateInput={handleInputChange}
                                        onBeforeAdd={handleBeforeChipAdd}
                                        onAdd={handleChipAdd}
                                        onDelete={handleChipDelete}
                                        autoFocus
                                        fullWidth
                                        fullWidthInput
                                    />
                                </form>

                                <Grid container justify="space-between">
                                    <Grid item>
                                        <Typography variant="caption">
                                            Refine your search using{' '}
                                            <a href={SEARCH_GUIDE}>
                                                this handy guide
                                            </a>
                                            .
                                        </Typography>
                                    </Grid>

                                    <Grid item>
                                        <Typography variant="caption">
                                            <Link href="/batch-search">
                                                <a>Batch search</a>
                                            </Link>
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <SearchSettings
                                    size={size}
                                    order={order}
                                    changeSize={handleSizeChange}
                                    changeOrder={handleOrderChange}
                                />
                            </Grid>
                        </Grid>

                        {error && (
                            <div className={classes.error}>
                                <Typography color="error">{error}</Typography>
                            </div>
                        )}

                        <Grid container>
                            <Grid item sm={12}>
                                <SearchResults
                                    loading={loading}
                                    results={results}
                                    query={query}
                                    changePage={handlePageChange}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </SplitPaneLayout>
            </HotKeys>
        </ErrorBoundary>
    )
}

export async function getServerSideProps({ req, query }) {
    api.cookie = req.headers.cookie
    try {
        const collections = await api.collections()
        if (query.collections && !Array.isArray(query.collections)) {
            query.collections = [query.collections]
        }
        const results = query.q ? await api.search(query) : null
        return { props: { collections, results }}
    } catch (error) {
        console.log(error)
        return { props: { error: error.reason ? error.reason : error.message }}
    }
}
