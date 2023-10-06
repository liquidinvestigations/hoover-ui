import { Box, Typography } from '@mui/material'
import { FC } from 'react'

import { BatchResult } from '../../../../Types'

import { useStyles } from './BatchResults.styles'

const getResultsCount = (results: BatchResult) => (results.count === undefined ? Infinity : results.count)
const resultsCompareFn = (a: BatchResult, b: BatchResult) => getResultsCount(b) - getResultsCount(a)

interface BatchResultsProps {
    loading: boolean
    results?: BatchResult[]
    batchSize: number
    offset: number
    terms?: string[]
}

export const BatchResults: FC<BatchResultsProps> = ({ loading, results, batchSize, offset, terms }) => {
    const { classes, cx } = useStyles()

    if (!results || !terms) {
        return null
    }

    const page = offset / batchSize
    const total = Math.ceil(terms?.length / batchSize)
    const progressMessage = `Loading, ${page} of ${total}`

    return (
        <Box>
            {loading && <Typography className={classes.progress}>{progressMessage}</Typography>}

            {results && (
                <ul className={classes.results}>
                    {results.sort(resultsCompareFn).map(({ term, count, url, error }, index) => (
                        <li key={index} className={cx({ [classes.noHits]: count === 0 })} data-test="result">
                            <Typography>
                                <a href={url} target="_blank" rel="noreferrer" className={classes.resultLink}>
                                    {error ? (
                                        <span className={cx(classes.result, classes.error)}>error</span>
                                    ) : (
                                        <span className={classes.result}>{count} hits</span>
                                    )}
                                    {term}
                                </a>
                            </Typography>
                        </li>
                    ))}
                </ul>
            )}
        </Box>
    )
}
