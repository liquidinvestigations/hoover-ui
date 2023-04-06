import { Button, Grid, List, TextField, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useState } from 'react'

import { batch } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { createSearchUrl } from '../../utils/queryUtils'
import { Expandable } from '../common/Expandable/Expandable'
import { Loading } from '../common/Loading/Loading'

import BatchResults from './BatchResults'
import { CollectionsFilter } from './filters/CollectionsFilter/CollectionsFilter'

const useStyles = makeStyles((theme) => ({
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    rateLimit: {
        color: '#888',
        fontSize: '14px',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}))

export default function BatchSearch({ collectionsData, limits }) {
    const classes = useStyles()

    const [selectedCollections, setSelectedCollections] = useState(collectionsData?.map((c) => c.name))
    const handleSelectedCollectionsChange = (collections) => {
        setSelectedCollections(collections)
        search(collections)
    }

    const [terms, setTerms] = useState()
    const handleTermsChange = (event) => {
        setTerms(event.target.value)
    }

    const [error, setError] = useState()
    const [batchOffset, setBatchOffset] = useState(0)
    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(false)

    const search = (collections = selectedCollections, offset = 0) => {
        if (!terms?.trim() || !selectedCollections) return null
        const allTerms = terms.trim().split('\n')

        const searchResults = []
        setResultsLoading(true)
        const termsPage = allTerms.slice(offset, offset + limits.batch)

        batch({
            query_strings: termsPage,
            collections,
        })
            .then((response) => {
                if (response.status === 'error') {
                    setError(response.message)
                } else {
                    const responseResults = response.responses.map((item) => {
                        const result = {
                            term: item._query_string,
                            url: createSearchUrl(item._query_string, undefined, collections),
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
                    if (nextOffset >= allTerms.length) {
                        setResults(searchResults)
                        setResultsLoading(false)
                    } else {
                        setBatchOffset(nextOffset)
                        search(collections, nextOffset)
                    }
                }
            })
            .catch((error) => {
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
            <Grid item sm={3}>
                <List dense>
                    <Expandable title="Collections" defaultOpen highlight={false}>
                        <CollectionsFilter />
                    </Expandable>
                </List>
            </Grid>
            <Grid item sm={5}>
                <div className={classes.main}>
                    <TextField
                        variant="standard"
                        label="Batch search queries (one per line)"
                        rows="4"
                        margin="normal"
                        maxRows={limits?.batch || Infinity}
                        value={terms}
                        onChange={handleTermsChange}
                        multiline
                        fullWidth
                        autoFocus
                    />

                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={reactIcons.batchSearch}
                                disabled={resultsLoading}
                                onClick={handleSearch}>
                                Batch search
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography className={classes.rateLimit}>
                        {'rate limit: '}
                        {limits.batch * limits.requests.limit}
                        {' terms every '}
                        {limits.requests.interval}
                        {' seconds'}
                    </Typography>

                    <BatchResults
                        loading={resultsLoading}
                        results={results}
                        offset={batchOffset}
                        batchSize={limits.batch}
                        terms={terms?.trim().split('\n')}
                    />
                </div>
            </Grid>
        </Grid>
    )
}
