import React, { memo, useEffect, useState } from 'react'
import lucene from 'lucene'
import { Box, ButtonBase, Chip, FormControl, Menu, MenuItem, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { blue, green, red } from '@material-ui/core/colors'
import { DEFAULT_OPERATOR, SEARCH_QUERY_PREFIXES } from '../constants'

const useStyles = makeStyles(theme => ({
    box: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:nth-last-child(2)': {
            marginRight: 0,
        },
    },
    operator: {
        display: 'block',
        textAlign: 'center',
        lineHeight: '30px',
        fontSize: '10px',
        width: '100%',
        height: theme.spacing(1),
        marginTop: theme.spacing(1) / 2,
        borderLeft: '1px solid black',
        borderRight: '1px solid black',
        borderBottom: 'solid 1px black',
    },
    AND: {
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
    },
    OR: {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
    },
    'AND-NOT': {
        color: red.A700,
        borderColor: red.A700,
    },
    'OR-NOT': {
        color: blue.A700,
        borderColor: blue.A700,
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:nth-last-child(2)': {
            marginRight: 0,
        }
    },

    tooltipChip: {
        backgroundColor: green.A100,
    },

    fieldChip: {
        backgroundColor: red.A100,
    },
}))

const replaceNode = (parent, node) => {
    if (parent.left === node) {
        if (parent.right) {
            return {...parent.right, parenthesized: parent.parenthesized}
        } else {
            return null
        }
    } else if (parent.right === node) {
        return {...parent.left, parenthesized: parent.parenthesized}
    } else {
        return {...parent}
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

function SearchQueryChips({ query, onQueryChange }) {
    const classes = useStyles()
    const [parsedQuery, setParsedQuery] = useState()

    useEffect(() => {
        try {
            setParsedQuery(lucene.parse(query))
        } catch {}
    }, [query])

    const [selectedChip, setSelectedChip] = useState(null)
    const [isExpression, setExpression] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const handleChipClick = (chip, parentOperator) => event => {
        setSelectedChip(chip)
        setExpression(!!parentOperator)
        setAnchorEl(event.currentTarget)
    }
    const handleChipMenuClose = () => {
        setAnchorEl(null)
    }
    const handleDelete = () => {
        onQueryChange(lucene.toString(rebuildTree(parsedQuery, selectedChip)))
        handleChipMenuClose()
    }

    const build = (q, parentOperator) => {
        const operator = q.operator === '<implicit>' ? DEFAULT_OPERATOR : q.operator
        const operatorClass = operator?.replace(' ', '-')
        if (q.field) {
            let label, className = classes.chip

            if (q.field === '<implicit>') {
                label = q.term
            } else if (SEARCH_QUERY_PREFIXES.includes(q.field)) {
                label = q.field + ':' + q.term
                className += ' ' + classes.fieldChip
            } else if (q.term) {
                label = q.field + ':' + q.term
            } else {
                label = lucene.toString(q)
            }

            if (q.prefix || q.similarity || q.proximity || q.boost) {
                return (
                    <Tooltip placement="top" title={(
                        <>
                            <Box>{q.prefix && 'Prefix: ' + q.prefix}</Box>
                            <Box>{q.similarity && 'Similarity: ' + q.similarity}</Box>
                            <Box>{q.proximity && 'Proximity: ' + q.proximity}</Box>
                            <Box>{q.boost && 'Boost: ' + q.boost}</Box>
                        </>
                    )}>
                        <Chip
                            label={label}
                            className={className + ' ' + classes.tooltipChip}
                            onClick={handleChipClick(q)}
                        />
                    </Tooltip>
                )
            }

            return (
                <Chip
                    label={label}
                    className={className}
                    onClick={handleChipClick(q)}
                />
            )

        } else if (parentOperator === operator) {

            return (
                q.left && q.right ?
                    <>
                        {build(q.left, operator)}
                        {build(q.right, operator)}
                    </> :
                q.left ? build(q.left, operator) : null
            )
        } else {

            return (
                q.left && q.right ?
                    <>
                        <Box className={classes.box}>
                            {build(q.left, operator)}
                            {build(q.right, operator)}
                            <ButtonBase
                                className={classes.operator + ' ' + classes[operatorClass]}
                                onClick={handleChipClick(q, operator)}
                            >
                                {operator}
                            </ButtonBase>
                        </Box>
                    </> :
                q.left ? build(q.left, operator) : null
            )
        }
    }

    return query && parsedQuery ?
        <FormControl margin="normal">
            {build(parsedQuery)}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleChipMenuClose}
            >
                <MenuItem onClick={handleDelete}>
                    delete selected {isExpression ? 'expression' : 'term'}
                </MenuItem>
            </Menu>
        </FormControl> : null
}

export default memo(SearchQueryChips)
