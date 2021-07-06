import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Typography } from '@material-ui/core'
import cn from 'classnames'

const useStyles = makeStyles(theme => ({
    progress: {
        float: 'right',
    },
    results: {
        padding: 0,
        listStyle: 'none',
        marginTop: theme.spacing(1),
    },
    noHits: {
        '& a': {
            color: '#888',
        }
    },
    resultLink: {
        display: 'block',
        fontSize: '16px',
    },
    result: {
        width: '7em',
        fontSize: '80%',
        fontWeight: 'normal',
        textDecoration: 'none',
        display: 'inline-block',
        color: '#888',
    },
    error: {
        color: 'red',
    },
}))

const getResultsCount = results => (results.count === undefined ? Infinity : results.count)
const resultsCompareFn = (a, b) => getResultsCount(b) - getResultsCount(a)

export default function BatchResults({ loading, results, batchSize, offset, terms }) {
    const classes = useStyles()

    const page = offset / batchSize;
    const total = Math.ceil(terms?.length / batchSize);
    const progressMessage = `Loading, ${page} of ${total}`;

    return (
        <Box>
            {loading &&
                <Typography className={classes.progress}>{progressMessage}</Typography>
            }

            {results &&
                <ul className={classes.results}>
                    {results.sort(resultsCompareFn).map(({ term, count, url, error }, index) =>
                        <li key={index} className={cn({ [classes.noHits]: count === 0 })} data-test="result">
                            <Typography>
                                <a href={url} target="_blank" className={classes.resultLink}>
                                    {error ? <span className={cn(classes.result, classes.error)}>error</span> :
                                        <span className={classes.result}>{count} hits</span>
                                    }
                                    {term}
                                </a>
                            </Typography>
                        </li>
                    )}
                </ul>
            }
        </Box>
    )
}
