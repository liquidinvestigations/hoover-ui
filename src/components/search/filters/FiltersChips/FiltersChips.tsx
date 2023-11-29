import { Box, Chip, FormControl, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import lucene, { Node, NodeRangedTerm, NodeTerm } from 'lucene'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, ReactElement, useCallback } from 'react'

import { aggregationFields } from '../../../../constants/aggregationFields'
import { SourceField } from '../../../../Types'
import { getTagIcon, shortenName } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'
import { ChipsTree } from '../../chips/ChipsTree/ChipsTree'

import { useStyles } from './FiltersChips.styles'

export const FiltersChips: FC = observer(() => {
    const { classes } = useStyles()
    const {
        query,
        filtersStore: { handleFilterChipDelete, parsedFilters },
    } = useSharedStore().searchStore

    const getDefaultLabel = (n: lucene.NodeTerm & lucene.NodeRangedTerm, term: JSX.Element | string, name?: string | ReactElement) => (
        <span>
            <strong>{name}:</strong> {n.boost === 1 ? <i>{term}</i> : shortenName(term as string)}
        </span>
    )

    const getBucketTerm = (term: JSX.Element | string, bucket?: { key: string; label: ReactElement }) => (bucket ? bucket.label || bucket.key : term)

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
                    term = getBucketTerm(term, bucket)
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

                label = getDefaultLabel(n, term, name)
            }

            return <Chip label={label} className={className} />
        },
        [classes.chip, classes.dateChip, classes.negationChip],
    )

    const renderMenu = useCallback((isExpression: boolean) => `delete selected ${isExpression ? 'expression' : 'filter'}`, [])

    return query && parsedFilters ? (
        <Box>
            <Typography className={classes.treeTitle}>
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
