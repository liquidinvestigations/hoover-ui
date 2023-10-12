import { Box, Chip, FormControl, Tooltip, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import lucene, { AST, Node, NodeTerm } from 'lucene'
import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect, useState } from 'react'

import { defaultSearchParams } from '../../../../utils/queryUtils'
import { shortenName } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'
import { ChipsTree } from '../ChipsTree/ChipsTree'

import { useStyles } from './QueryChips.styles'

export interface ExtendedNodeTerm extends NodeTerm {
    proximity: null | number
}

const replaceNode = (parent: AST | Node, node: AST | Node): AST | Node | null => {
    if ('left' in parent && parent.left === node) {
        if ('right' in parent && parent.right) {
            return { ...parent.right, parenthesized: parent.parenthesized } as AST
        } else {
            return null
        }
    } else if ('right' in parent && parent.right === node) {
        return { ...parent.left, parenthesized: parent.parenthesized } as AST
    } else {
        return { ...parent } as AST
    }
}

const rebuildTree = (parent: AST | Node, node: AST | Node): AST | Node | null => {
    if (parent === node) {
        return null
    }
    const root = replaceNode(parent, node)
    if (root && 'left' in root && root.left) {
        root.left = rebuildTree(root.left, node) ?? root.left
    }
    if (root && 'right' in root && root.right) {
        root.right = rebuildTree(root.right, node) ?? root.right
    }
    return root
}

export const QueryChips: FC = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const { query, search } = useSharedStore().searchStore
    const [parsedQuery, setParsedQuery] = useState<AST>()

    useEffect(() => {
        try {
            query && setParsedQuery(lucene.parse(query.q))
        } catch {
            setParsedQuery(undefined)
        }
    }, [query])

    const handleDelete = useCallback(
        (node: AST | Node) => {
            parsedQuery && search({ q: lucene.toString(rebuildTree(parsedQuery, node) as AST), page: defaultSearchParams.page })
        },
        [parsedQuery, search],
    )

    const getChip = useCallback(
        (q: Partial<ExtendedNodeTerm>) => {
            let label,
                prefix = q.prefix,
                className = classes.chip
            if (prefix === '-' || prefix === '!') {
                prefix = null
                className += ' ' + classes.negationChip
            }
            if (q.field === '<implicit>') {
                label = (
                    <span>
                        {prefix && <strong>{prefix} </strong>}
                        {shortenName(q.term)}
                    </span>
                )
            } else if (q.term) {
                label = (
                    <span>
                        {prefix && <strong>{prefix} </strong>}
                        <strong>{q.field}:</strong> {shortenName(q.term)}
                    </span>
                )
            } else {
                label = lucene.toString(q as AST)
            }

            if (q.similarity || q.proximity || q.boost) {
                return (
                    <Tooltip
                        placement="top"
                        title={
                            <>
                                {q.similarity && (
                                    <Box>
                                        <strong>
                                            <T keyName="similarity">Similarity</T>:
                                        </strong>{' '}
                                        {q.similarity}
                                    </Box>
                                )}
                                {q.proximity && (
                                    <Box>
                                        <strong>
                                            <T keyName="proximity">Proximity</T>:
                                        </strong>{' '}
                                        {q.proximity}
                                    </Box>
                                )}
                                {q.boost && (
                                    <Box>
                                        <strong>
                                            <T keyName="boost">Boost</T>:
                                        </strong>{' '}
                                        {q.boost}
                                    </Box>
                                )}
                            </>
                        }>
                        <Chip label={label} className={className + ' ' + classes.tooltipChip} />
                    </Tooltip>
                )
            }

            return <Chip label={label} className={className} />
        },
        [classes.chip, classes.negationChip, classes.tooltipChip],
    )

    const renderMenu = useCallback(
        (isExpression: boolean) =>
            isExpression ? t('delete_selected_expression', 'delete selected expression') : t('delete_selected_term', 'delete selected term'),
        [t],
    )

    return query?.q && parsedQuery ? (
        <Box>
            <Typography className={classes.treeTitle}>
                <T keyName="query">Query</T>
            </Typography>
            <FormControl variant="standard" margin="normal">
                <ChipsTree
                    tree={parsedQuery}
                    renderChip={getChip}
                    renderMenu={renderMenu}
                    onChipDelete={handleDelete}
                    onExpressionDelete={handleDelete}
                />
            </FormControl>
        </Box>
    ) : null
})
