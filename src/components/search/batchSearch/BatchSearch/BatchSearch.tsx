import { Button, Grid, List, TextField, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { ChangeEvent, useState } from 'react'

import { batch } from '../../../../backend/api'
import { reactIcons } from '../../../../constants/icons'
import { createSearchUrl } from '../../../../utils/queryUtils'
import { Expandable } from '../../../common/Expandable/Expandable'
import { Loading } from '../../../common/Loading/Loading'
import { useSharedStore } from '../../../SharedStoreProvider'
import { CollectionsFilter } from '../../filters/CollectionsFilter/CollectionsFilter'
import { BatchResults } from '../BatchResults/BatchResults'

import { useStyles } from './BatchSearch.styles'

interface BatchResult {
    term: string
    url: string
    error?: boolean
    count?: number
}

export const BatchSearch = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()

    const {
        limits,
        searchStore: {
            searchViewStore: { searchCollections },
        },
    } = useSharedStore()

    const [terms, setTerms] = useState<string | undefined>()
    const handleTermsChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTerms(event.target.value)
    }

    const [error, setError] = useState<string | undefined>()
    const [batchOffset, setBatchOffset] = useState(0)
    const [results, setResults] = useState<BatchResult[] | undefined>()
    const [resultsLoading, setResultsLoading] = useState(false)

    const search = (collections = searchCollections, offset = 0) => {
        if (!terms?.trim() || !searchCollections || !limits) return null
        const allTerms = terms.trim().split('\n')

        const searchResults: BatchResult[] = []
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
                        const result: BatchResult = {
                            term: item._query_string,
                            url: createSearchUrl(item._query_string, collections),
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
                    message = t('rate_limit_error', 'Rate limit exceeded')
                } else if (!message) {
                    message = t('unknown_search_error', 'Unknown server error while searching')
                }
                setError(message)
                setResultsLoading(false)
            })
    }

    const handleSearch = () => {
        setResults(undefined)
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
                    <Expandable title={t('collections', 'Collections')} defaultOpen highlight={false}>
                        <CollectionsFilter />
                    </Expandable>
                </List>
            </Grid>
            <Grid item sm={5}>
                <div className={classes.main}>
                    <TextField
                        variant="standard"
                        label={t('batch_search_queries', 'Batch search queries (one per line)')}
                        minRows={4}
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
                                onClick={handleSearch}
                            >
                                <T keyName="batch_search_button">Batch search</T>
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography className={classes.rateLimit}>
                        <T keyName="rate_limit" params={{ batch: limits.batch, interval: limits.requests.interval }}>
                            {'rate limit: {batch} terms every {interval} seconds'}
                        </T>
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
})
