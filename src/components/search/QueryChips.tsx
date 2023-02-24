import { Box, Chip, FormControl, Theme, Tooltip, Typography } from '@mui/material'
import { blue, red } from '@mui/material/colors'
import { makeStyles } from '@mui/styles'
import lucene, { AST, Node, NodeTerm } from 'lucene'
import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect, useState } from 'react'

import { defaultSearchParams } from '../../utils/queryUtils'
import { shortenName } from '../../utils/utils'
import { useSharedStore } from '../SharedStoreProvider'

import { ChipsTree } from './ChipsTree'

export interface ExtendedNodeTerm extends NodeTerm {
    proximity: null | number
}

const useStyles = makeStyles((theme: Theme) => ({
    treeTitle: {
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: blue.A100,
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },

    tooltipChip: {
        backgroundColor: blue.A200,
    },

    negationChip: {
        marginBottom: 0,
        cursor: 'pointer',
        backgroundColor: red.A200,
    },
}))

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
    const classes = useStyles()
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
        [parsedQuery, search]
    )

    const getChip = useCallback((q: Partial<ExtendedNodeTerm>) => {
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
                                    <strong>Similarity:</strong> {q.similarity}
                                </Box>
                            )}
                            {q.proximity && (
                                <Box>
                                    <strong>Proximity:</strong> {q.proximity}
                                </Box>
                            )}
                            {q.boost && (
                                <Box>
                                    <strong>Boost:</strong> {q.boost}
                                </Box>
                            )}
                        </>
                    }>
                    <Chip label={label} className={className + ' ' + classes.tooltipChip} />
                </Tooltip>
            )
        }

        return <Chip label={label} className={className} />
    }, [])

    const renderMenu = useCallback((isExpression: boolean) => `delete selected ${isExpression ? 'expression' : 'term'}`, [])

    return query?.q && parsedQuery ? (
        <Box>
            <Typography variant="h6" className={classes.treeTitle}>
                Query
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
