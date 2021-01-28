import React, { useCallback, useEffect, useState } from 'react'
import { useSearch } from './SearchProvider'
import { makeStyles } from '@material-ui/core/styles'
import lucene from 'lucene'
import { Box, Chip, FormControl, Typography } from '@material-ui/core'
import { green, red } from '@material-ui/core/colors'
import ChipsTree from './ChipsTree'

const useStyles = makeStyles(theme => ({
    treeTitle: {
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: green.A100,
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:nth-last-child(2)': {
            marginRight: 0,
        }
    },

    negationChip: {
        cursor: 'pointer',
        backgroundColor: red.A100,
    },
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
                    values.include?.forEach(value => {
                        filtersArray.push(`${key}:${value}`)
                    })
                    values.exclude?.forEach(value => {
                        filtersArray.push(`(${key}:-${value})`)
                    })
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
        return (
            <Chip
                label={`${q.field}: ${q.term}`}
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
