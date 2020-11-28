import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import qs from 'qs'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, List, Typography } from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'
import HotKeys from '../src/components/HotKeys'
import SplitPaneLayout from '../src/components/SplitPaneLayout'
import SearchSettings from '../src/components/SearchSettings'
import SearchResults from '../src/components/SearchResults'
import Filter from '../src/components/filters/Filter'
import Filters from '../src/components/filters/Filters'
import CollectionsFilter from '../src/components/filters/CollectionsFilter'
import Document from '../src/components/document/Document'
import { ProgressIndicatorContext } from '../src/components/ProgressIndicator'
import { SEARCH_GUIDE, SEARCH_QUERY_PREFIXES, SORT_RELEVANCE } from '../src/constants'
import useCollections from '../src/hooks/useCollections'
import { copyMetadata } from '../src/utils'
import api from '../src/api'

const extractFields = query => {
    const fields = []
    const queryParts = query ? query.match(/(?:[^\s"\[{]+|"[^"]*"|[\[{][^\]}]*[\]}])+/g) : []
    const otherInput = []
    queryParts?.forEach(part => {
        if (part.indexOf(':') > 0) {
            const partParts = part.split(':')
            if (SEARCH_QUERY_PREFIXES.indexOf(partParts[0]) >= 0 && partParts[1].length > 0) {
                fields.push(part)
            } else {
                otherInput.push(part)
            }
        } else {
            otherInput.push(part)
        }
    })
    return [fields, otherInput.join(' ')]
}

const defaultParams = {
    page: 1,
    size: 10,
    order: SORT_RELEVANCE,
}

export const buildUrlQuery = (params) => {
    const { q, fields, text, ...rest } = params
    return qs.stringify({
        q: (fields?.length ? fields.join(' ') + ' ' : '') + (text || ''),
        ...defaultParams,
        ...rest,
    })
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

export default function Index({ serverQuery }) {
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
    const { pathname } = router

    const getQueryString = () => {
        if (typeof window === 'undefined') {
            return serverQuery
        }
        return window.location.href.split('?')[1]
    }
    const query = qs.parse(getQueryString())

    let inputRef = null
    const setInputRef = element => inputRef = element
    const isInputFocused = () => inputRef === document.activeElement

    const [ queryFields, queryText ] = extractFields(query.q)
    const [chips, setChips] = useState(queryFields)
    const [text, setText] = useState(queryText)

    const search = params => {
        const stateParams = { fields: chips, text, size, order, page, collections: selectedCollections }
        const query = buildUrlQuery({ ...query, ...stateParams, ...params })
        router.push(
            { pathname, query },
            undefined,
            { shallow: true },
        )
    }

    const [collections, collectionsLoading, selectedCollections, setSelectedCollections] = useCollections()
    const handleSelectedCollectionsChange = collections => {
        setSelectedCollections(collections)
        search({ collections, page: 1 })
    }

    const [size, setSize] = useState(query.size || defaultParams.size)
    const handleSizeChange = size => {
        setSize(size)
        search({ size, page: 1 })
    }

    const [order, setOrder] = useState(query.order || defaultParams.order)
    const handleOrderChange = order => {
        setOrder(order)
        search({ order, page: 1 })
    }

    const [page, setPage] = useState(query.page || defaultParams.page)
    const handlePageChange = page => {
        setPage(page)
        search({ page })
    }

    const handleFilterApply = filter => search({ ...filter, page: 1 })

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
        const fields = [...chips]
        fields.splice(chipIndex, 1)
        setChips(fields)
        search({ fields, page: 1 })
    }

    const handleSubmit = event => {
        event.preventDefault()
        search({ text, page: 1 })
    }


    const [selectedDocUrl, setSelectedDocUrl] = useState()
    const [selectedDocData, setSelectedDocData] = useState()
    const [previewLoading, setPreviewLoading] = useState(false)
    const handleDocPreview = url => {
        setSelectedDocUrl(url)
        setPreviewLoading(true)
        api.doc(url).then(data => {
            setSelectedDocData(data)
            setPreviewLoading(false)
        })
    }


    const [error, setError] = useState()
    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(!!query.q)
    useEffect(() => {
        if (collections && query.q) {
            const [ queryFields, queryText ] = extractFields(query.q)
            setChips(queryFields)
            setText(queryText)

            setError(null)
            setResultsLoading(true)

            api.search(query).then(results => {
                setResults(results)
                setResultsLoading(false)
            }).catch(error => {
                setResults(null)
                setError(error.reason ? error.reason : error.message)
                setResultsLoading(false)
            })
        } else if (pathname === '/') {
            setResults(null)
            setChips(null)
            setText('')
        }
    }, [collections, JSON.stringify(query)])


    const { setLoading } = useContext(ProgressIndicatorContext)
    useEffect(() => {
        setLoading(collectionsLoading || resultsLoading || previewLoading)
    }, [collectionsLoading, resultsLoading, previewLoading])


    return (
        <HotKeys keys={keys} focused>
            <SplitPaneLayout
                left={
                    <>
                        <List dense>
                            <Filter title="Collections" colorIfFiltered={false}>
                                <CollectionsFilter
                                    collections={collections}
                                    loading={collectionsLoading}
                                    selected={selectedCollections}
                                    changeSelection={handleSelectedCollectionsChange}
                                    counts={results?.count_by_index}
                                />
                            </Filter>
                        </List>

                        <Filters
                            loading={resultsLoading}
                            query={query}
                            aggregations={results?.aggregations}
                            applyFilter={handleFilterApply}
                        />
                    </>
                }
                right={
                    <Document docUrl={selectedDocUrl} data={selectedDocData} loading={previewLoading} />
                }
            >
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
                                results={results}
                                loading={resultsLoading}
                                query={query}
                                changePage={handlePageChange}
                                onPreview={handleDocPreview}
                                selectedDocUrl={selectedDocUrl}
                            />
                        </Grid>
                    </Grid>
                </div>
            </SplitPaneLayout>
        </HotKeys>
    )
}

export async function getServerSideProps({ req }) {
    const serverQuery = req.url.split('?')[1] || ''
    return { props: { serverQuery }}
}
