import { Box, Chip, FormControl, Tooltip, Typography } from '@mui/material'
import { blue, red } from '@mui/material/colors'
import { makeStyles } from '@mui/styles'
import lucene from 'lucene'
import { memo, useCallback, useEffect, useState } from 'react'


import { shortenName } from '../../utils/utils'

import ChipsTree from './ChipsTree'
import { useSearch } from './SearchProvider'

const useStyles = makeStyles((theme) => ({
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

const replaceNode = (parent, node) => {
    if (parent.left === node) {
        if (parent.right) {
            return { ...parent.right, parenthesized: parent.parenthesized }
        } else {
            return null
        }
    } else if (parent.right === node) {
        return { ...parent.left, parenthesized: parent.parenthesized }
    } else {
        return { ...parent }
    }
}

const rebuildTree = (parent, node) => {
    if (parent === node) {
        return null
    }
    const root = replaceNode(parent, node)
    if (root?.left) {
        root.left = rebuildTree(root.left, node)
    }
    if (root?.right) {
        root.right = rebuildTree(root.right, node)
    }
    return root
}

function QueryChips() {
    const classes = useStyles()
    const { query, search } = useSearch()
    const [parsedQuery, setParsedQuery] = useState()

    useEffect(() => {
        try {
            setParsedQuery(lucene.parse(query.q))
        } catch {
            setParsedQuery(null)
        }
    }, [query])

    const handleDelete = useCallback(
        (node) => {
            search({ q: lucene.toString(rebuildTree(parsedQuery, node)), page: 1 })
        },
        [parsedQuery, search]
    )

    const getChip = useCallback((q) => {
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
            label = lucene.toString(q)
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

    const renderMenu = useCallback((isExpression) => `delete selected ${isExpression ? 'expression' : 'term'}`, [])

    return query.q && parsedQuery ? (
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
}

export default memo(QueryChips)
