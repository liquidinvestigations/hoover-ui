import React, { useState } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Grid, List, TextField, Typography } from '@material-ui/core'
import Expandable from '../Expandable'
import Loading from '../Loading'
import BatchResults from './BatchResults'
import CollectionsFilter from './filters/CollectionsFilter'
import { createSearchUrl } from '../../queryUtils'
import { batch } from '../../backend/api'

const useStyles = makeStyles(theme => ({
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    rateLimit: {
        color: '#888',
        fontSize: '14px',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    }
}))

export default function BatchSearch({ collections, limits }) {
    const classes = useStyles()

    const [selectedCollections, setSelectedCollections] = useState(collections?.map(c => c.name))
    const handleSelectedCollectionsChange = collections => {
        setSelectedCollections(collections)
        search(collections)
    }

    const [terms, setTerms] = useState()
    const handleTermsChange = event => {
        setTerms(event.target.value)
    }

    const [error, setError] = useState()
    const [batchOffset, setBatchOffset] = useState(0)
    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(false)

    const search = (collections = selectedCollections, offset = 0) => {
        if (!terms.trim() || !selectedCollections) return null

        const searchResults = []
        setResultsLoading(true)
        const termsPage = terms.trim().split('\n').slice(offset, offset + limits.batch);

        batch({
            query_strings: termsPage,
            collections,
        }).then(response => {
            if (response.status === 'error') {
                setError(response.message)
            } else {
                const responseResults = response.responses.map(item => {
                    const result = {
                        term: item._query_string,
                        url: createSearchUrl(item._query_string, undefined, collections)
                    }
                    if (item.error) {
                        result.error = true
                    } else {
                        result.count = item.hits.total
                    }
                    return result
                })
                searchResults.push(...responseResults)

                const nextOffset = offset + limits.batch
                if (nextOffset >= terms.length) {
                    setResults(searchResults)
                    setResultsLoading(false)
                } else {
                    setBatchOffset(nextOffset)
                    search(collections, nextOffset)
                }
            }
        }).catch(error => {
            let message = error.statusText
            if (error.status === 429) {
                message = 'Rate limit exceeded'
            } else if (!message) {
                message = 'Unknown server error while searching'
            }
            setError(message)
            setResultsLoading(false)
        })
    }

    const handleSearch = () => {
        setResults(null)
        search()
    }

    if (!limits) {
        return <Loading />
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <Grid container>
            <Grid item sm={2}>
                <Expandable
                    title={`Collections (${selectedCollections?.length || 0})`}
                    defaultOpen
                    highlight={false}
                >
                    <CollectionsFilter
                        collections={collections}
                        selected={selectedCollections}
                        changeSelection={handleSelectedCollectionsChange}
                        counts={results?.count_by_index}
                    />
                </Expandable>
            </Grid>
            <Grid item sm={6}>
                <div className={classes.main}>
                    <TextField
                        label="Batch search queries (one per line)"
                        rows="4"
                        margin="normal"
                        rowsMax={limits?.batch || Infinity}
                        value={terms}
                        onChange={handleTermsChange}
                        multiline
                        fullWidth
                        autoFocus
                    />

                    <Grid container justify="space-between">
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={resultsLoading}
                                onClick={handleSearch}
                            >
                                Batch search
                            </Button>
                        </Grid>
                        <Grid item>
                            <Link href="/">
                                <a>
                                    <Typography>
                                        Back to single search
                                    </Typography>
                                </a>
                            </Link>
                        </Grid>
                    </Grid>

                    <Typography className={classes.rateLimit}>
                        {'rate limit: '}{limits.batch * limits.requests.limit}
                        {' terms every '}{limits.requests.interval}{' seconds'}
                    </Typography>

                    <BatchResults
                        loading={resultsLoading}
                        results={results}
                        offset={batchOffset}
                        batchSize={limits.batch}
                        terms={terms}
                    />
                </div>
            </Grid>
        </Grid>
    )
}
