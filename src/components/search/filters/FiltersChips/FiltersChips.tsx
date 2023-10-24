import { Box, Chip, FormControl, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import lucene, { AST, Node, NodeRangedTerm, NodeTerm } from 'lucene'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, useCallback, useEffect, useState } from 'react'

import { aggregationFields } from '../../../../constants/aggregationFields'
import { SourceField } from '../../../../Types'
import { clearQuotedParam } from '../../../../utils/queryUtils'
import { getTagIcon, shortenName } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'
import { ChipsTree } from '../../chips/ChipsTree/ChipsTree'

import { useStyles } from './FiltersChips.styles'

export const FiltersChips: FC = observer(() => {
    const { classes } = useStyles()
    const {
        query,
        filtersStore: { handleFilterChipDelete },
    } = useSharedStore().searchStore

    const [parsedFilters, setParsedFilters] = useState<AST>()

    useEffect(() => {
        if (query?.filters) {
            const filtersArray: string[] = []

            Object.entries(query.filters).forEach(([key, values]) => {
                let filter = ''
                if (values.from && values.to) {
                    filter = `${key}:[${values.from} TO ${values.to}]`
                }

                const intervalsArray = []
                if (values.intervals?.missing === 'true') {
                    intervalsArray.push(`(${key}:"N/A"^1)`)
                }
                values.intervals?.include?.forEach((value: string) => {
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
                const includeOperator = aggregationFields[key as SourceField]?.type === 'term-and' ? ' AND ' : ' OR '
                if (values.missing === 'true') {
                    includeArray.push(`(${key}:"N/A"^1)`)
                }
                values.include?.forEach((value: string) => {
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
                values.exclude?.forEach((value: string) => {
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
                setParsedFilters(undefined)
            }
        } else {
            setParsedFilters(undefined)
        }
    }, [query])

    const getChip = useCallback(
        (q: Node) => {
            const n = q as NodeTerm & NodeRangedTerm
            let className = classes.chip
            if (n.prefix === '-' || n.prefix === '!') {
                className += ' ' + classes.negationChip
            }

            let label
            const name = aggregationFields[n.field as SourceField]?.chipLabel
            if (n.term_min && n.term_max) {
                className += ' ' + classes.dateChip
                label = (
                    <span>
                        <strong>{name}:</strong> {n.term_min} to {n.term_max}
                    </span>
                )
            } else {
                let term: JSX.Element | string = n.term

                let buckets
                if ((buckets = aggregationFields[n.field as SourceField]?.buckets)) {
                    const bucket = buckets.find((bucket) => bucket.key === term)
                    term = bucket ? bucket.label || bucket.key : term
                }

                const icon = getTagIcon(term as string, n.field === 'tags', n.prefix === '-' || n.prefix === '!')
                if ((n.field === 'tags' || n.field === 'priv-tags') && !!icon) {
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
                        <strong>{name}:</strong> {n.boost === 1 ? <i>{term}</i> : shortenName(term as string)}
                    </span>
                )
            }

            return <Chip label={label} className={className} />
        },
        [classes.chip, classes.dateChip, classes.negationChip],
    )

    const renderMenu = useCallback((isExpression: boolean) => `delete selected ${isExpression ? 'expression' : 'filter'}`, [])

    return query && parsedFilters ? (
        <Box>
            <Typography variant="h6" className={classes.treeTitle}>
                <T keyName="filters">Filters</T>
            </Typography>
            <FormControl variant="standard" margin="normal">
                <ChipsTree
                    tree={parsedFilters}
                    renderChip={getChip}
                    renderMenu={renderMenu}
                    onChipDelete={handleFilterChipDelete}
                    onExpressionDelete={handleFilterChipDelete}
                />
            </FormControl>
        </Box>
    ) : null
})
