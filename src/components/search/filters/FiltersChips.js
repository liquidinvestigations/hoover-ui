import { Box, Chip, FormControl, Typography } from '@mui/material'
import { blue, green, red } from '@mui/material/colors'
import { makeStyles } from '@mui/styles'
import lucene from 'lucene'
import { cloneElement, useCallback, useEffect, useState } from 'react'

import { aggregationFields } from '../../../constants/aggregationFields'
import { clearQuotedParam } from '../../../utils/queryUtils'
import { getTagIcon, shortenName } from '../../../utils/utils'
import ChipsTree from '../ChipsTree'
import { useSearch } from '../SearchProvider'

const useStyles = makeStyles((theme) => ({
    treeTitle: {
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: green.A100,
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
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
    },
}))

const deleteFilterNode = (filters, node) => {
    if (aggregationFields[node.field].type === 'date') {
        let index
        const list = filters[node.field].intervals?.include

        if ((index = list?.indexOf(node.term)) > -1) {
            list.splice(index, 1)
        }

        if (node.term_min && node.term_max) {
            filters[node.field].from = filters[node.field].to = undefined
        }

        if (node.boost === 1 && filters[node.field].intervals?.missing) {
            filters[node.field].intervals.missing = undefined
        }
    } else if (node.term) {
        let index
        const filter = filters[node.field]

        if ((index = filter.include?.indexOf(node.term)) > -1) {
            filter.include.splice(index, 1)
        } else if ((index = filter.exclude?.indexOf(node.term)) > -1) {
            filter.exclude.splice(index, 1)
        } else if (node.boost === 1 && filter.missing) {
            filter.missing = undefined
        }
    }
    return filters
}

const deleteFilterOperands = (filters, node) => {
    if (node.field) {
        deleteFilterNode(filters, node)
    }
    if (node.left) {
        deleteFilterOperands(filters, node.left)
    }
    if (node.right) {
        deleteFilterOperands(filters, node.right)
    }
    return filters
}

export default function FiltersChips() {
    const classes = useStyles()
    const { query, search } = useSearch()
    const [parsedFilters, setParsedFilters] = useState()

    useEffect(() => {
        if (query.filters) {
            const filtersArray = []

            Object.entries(query.filters).forEach(([key, values]) => {
                let filter = ''
                if (values.from && values.to) {
                    filter = `${key}:[${values.from} TO ${values.to}]`
                }

                const intervalsArray = []
                if (values.intervals?.missing === 'true') {
                    intervalsArray.push(`(${key}:"N/A"^1)`)
                } else if (values.intervals?.missing === 'true') {
                    intervalsArray.push(`(${key}:-"N/A"^1)`)
                }
                values.intervals?.include?.forEach((value) => {
                    intervalsArray.push(`${key}:${value}`)
                })
                if (filter) {
                    if (intervalsArray.length) {
                        filtersArray.push(`(${[filter, `(${intervalsArray.join(' OR ')})`].join(' AND ')})`)
                    } else {
                        filtersArray.push(`(${filter})`)
                    }
                } else if (intervalsArray.length) {
                    filtersArray.push(`(${intervalsArray.join(' OR ')})`)
                }

                const includeArray = []
                const includeOperator = aggregationFields[key]?.type === 'term-and' ? ' AND ' : ' OR '
                if (values.missing === 'true') {
                    includeArray.push(`(${key}:"N/A"^1)`)
                }
                values.include?.forEach((value) => {
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
                if (values.missing === 'false') {
                    excludeArray.push(`(${key}:-"N/A"^1)`)
                }
                values.exclude?.forEach((value) => {
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

            if (filtersArray.length) {
                setParsedFilters(lucene.parse(filtersArray.join(' AND ')))
            } else {
                setParsedFilters(null)
            }
        } else {
            setParsedFilters(null)
        }
    }, [query])

    const handleDelete = useCallback(
        (node) => {
            search({ filters: deleteFilterOperands({ ...query.filters }, node) })
        },
        [search]
    )

    const getChip = useCallback((q) => {
        let className = classes.chip
        if (q.prefix === '-' || q.prefix === '!') {
            className += ' ' + classes.negationChip
        }

        let label
        const name = aggregationFields[q.field]?.chipLabel
        if (q.term_min && q.term_max) {
            className += ' ' + classes.dateChip
            label = (
                <span>
                    <strong>{name}:</strong> {q.term_min} to {q.term_max}
                </span>
            )
        } else {
            let term = q.term

            let buckets
            if ((buckets = aggregationFields[q.field]?.buckets)) {
                const bucket = buckets.find((bucket) => bucket.key === term)
                term = bucket ? bucket.label || bucket.key : term
            }

            const icon = getTagIcon(term, q.field === 'tags', q.prefix === '-' || q.prefix === '!')
            if ((q.field === 'tags' || q.field === 'priv-tags') && !!icon) {
                term = (
                    <>
                        {cloneElement(icon, {
                            style: {
                                ...icon.props.style,
                                fontSize: 18,
                                verticalAlign: 'middle',
                            },
                        })}{' '}
                        {term}
                    </>
                )
            }

            label = (
                <span>
                    <strong>{name}:</strong> {q.boost === 1 ? <i>{term}</i> : shortenName(term)}
                </span>
            )
        }

        return <Chip label={label} className={className} />
    }, [])

    const renderMenu = useCallback((isExpression) => `delete selected ${isExpression ? 'expression' : 'filter'}`, [])

    return query && parsedFilters ? (
        <Box>
            <Typography variant="h6" className={classes.treeTitle}>
                Filters
            </Typography>
            <FormControl variant="standard" margin="normal">
                <ChipsTree
                    tree={parsedFilters}
                    renderChip={getChip}
                    renderMenu={renderMenu}
                    onChipDelete={handleDelete}
                    onExpressionDelete={handleDelete}
                />
            </FormControl>
        </Box>
    ) : null
}
