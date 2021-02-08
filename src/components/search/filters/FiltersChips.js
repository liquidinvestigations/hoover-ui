import React, { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import lucene from 'lucene'
import { Box, Chip, FormControl, Typography } from '@material-ui/core'
import { blue, green, red } from '@material-ui/core/colors'
import ChipsTree from '../ChipsTree'
import { useSearch } from '../SearchProvider'
import { aggregationFields } from './aggregationFields'
import { clearQuotedParam } from '../../../queryUtils'
import { shortenName } from '../../../utils'

const useStyles = makeStyles(theme => ({
    treeTitle: {
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: green.A100,
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        }
    },

    negationChip: {
        marginBottom: 0,
        cursor: 'pointer',
        backgroundColor: red.A100,
    },

    dateChip: {
        backgroundColor: blue[300],
    },

    dateBucketChip: {
        backgroundColor: blue[100],
    }
}))

export default function FiltersChips() {
    const classes = useStyles()
    const { query, search } = useSearch()
    const [ parsedFilters, setParsedFilters ] = useState()

    useEffect(() => {
        try {
            if (query.filters) {
                const filtersArray = []

                Object.entries(query.filters).forEach(([key, values]) => {
                    let filter = ''
                    if (values.from && values.to) {
                        filter = `${key}:[${values.from} TO ${values.to}]`
                    }
                    const intervalsArray = []
                    values.intervals?.include?.forEach(value => {
                        intervalsArray.push(value)
                    })
                    if (filter) {
                        filtersArray.push(`(${[filter, `(${intervalsArray.join(' OR ')})`].join(' AND ')})`)
                    } else if (intervalsArray.length) {
                        filtersArray.push(`(${intervalsArray.join(' OR ')})`)
                    }

                    const includeArray = []
                    const includeOperator = aggregationFields[key].type === 'term-and' ? ' AND ' : ' OR '
                    values.include?.forEach(value => {
                        includeArray.push(`${key}:"${clearQuotedParam(value)}"`)
                    })
                    if (includeArray.length) {
                        if (includeArray.length > 1) {
                            filtersArray.push(`(${includeArray.join(includeOperator)})`)
                        } else {
                            filtersArray.push(`${includeArray[0]}`)
                        }
                    }

                    const excludeArray = []
                    values.exclude?.forEach(value => {
                        excludeArray.push(`(${key}:-"${clearQuotedParam(value)}")`)
                    })
                    if (excludeArray.length) {
                        if (excludeArray.length > 1) {
                            filtersArray.push(`(${excludeArray.join(' AND ')})`)
                        } else {
                            filtersArray.push(`${excludeArray[0]}`)
                        }
                    }
                })

                setParsedFilters(lucene.parse(filtersArray.join(' AND ')))
            } else {
                setParsedFilters(null)
            }

        } catch {}
    }, [query])

    const handleDelete = useCallback(() => {}, [])

    const getChip = useCallback(q => {
        let className = classes.chip
        if (q.prefix === '-' || q.prefix === '!') {
            className += ' ' + classes.negationChip
        }

        let label
        if (q.field !== '<implicit>') {
            const name = aggregationFields[q.field]?.chipLabel
            if (q.term_min && q.term_max) {
                className += ' ' + classes.dateChip
                label = (
                    <span>
                        <strong>{name}:</strong>{' '}
                        {q.term_min} to {q.term_max}
                    </span>
                )
            } else {
                label = (
                    <span>
                        <strong>{name}:</strong>{' '}
                        {shortenName(q.term)}
                    </span>
                )
            }
        } else {
            className += ' ' + classes.dateBucketChip
            label = <span>{q.term}</span>
        }

        return (
            <Chip
                label={label}
                className={className}
            />
        )
    }, [])

    const renderMenu = useCallback(isExpression =>
        `delete selected ${isExpression ? 'expression' : 'filter'}`, [])

    return query && parsedFilters ?
        <Box>
            <Typography variant="h6" className={classes.treeTitle}>
                Filters
            </Typography>
            <FormControl margin="normal">
                <ChipsTree
                    tree={parsedFilters}
                    renderChip={getChip}
                    renderMenu={renderMenu}
                    onChipDelete={handleDelete}
                    onExpressionDelete={handleDelete}
                />
            </FormControl>
        </Box> : null
}
