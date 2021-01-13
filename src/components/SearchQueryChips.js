import React, { memo, useEffect, useState } from 'react'
import lucene from 'lucene'
import { Box, ButtonBase, Chip, FormControl, Menu, MenuItem, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'
import { DEFAULT_OPERATOR, SEARCH_QUERY_PREFIXES } from '../constants'

const useStyles = makeStyles(theme => ({
    box: {
        float: 'left',
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:nth-last-child(2)': {
            marginRight: 0,
            float: 'right',
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
    NOT: {
        color: red.A700,
        borderColor: red.A700,
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

const ELLIPSIS_TERM_LENGTH = 30

const shortenName = name => name.length > ELLIPSIS_TERM_LENGTH ?
    `${name.substr(0, 17)}...${name.substr(-10)}` : name

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

    const getChip = (queryNode, label, className) => {
        return (
            <Chip
                label={label}
                className={className}
                onClick={handleChipClick(queryNode)}
            />
        )
    }

    const getNotBox = (negation, queryNode, chip) => {
        if (negation) {
            return (
                <Box className={classes.box}>
                    {chip}
                    <ButtonBase
                        className={classes.operator + ' ' + classes.NOT}
                        onClick={handleChipClick(queryNode, 'NOT')}
                    >
                        NOT
                    </ButtonBase>
                </Box>
            )
        }
        return chip
    }

    const build = (q, parentOperator) => {
        let operator, leftNegation = q.start === 'NOT', rightNegation = false

        switch (q.operator) {
            case '<implicit>':
                operator = DEFAULT_OPERATOR
                break
            case 'NOT':
                operator = DEFAULT_OPERATOR
                rightNegation = true
                break
            case 'AND NOT':
                operator = 'AND'
                rightNegation = true
                break
            case 'OR NOT':
                operator = 'OR'
                rightNegation = true
                break
            case 'AND':
            case 'OR':
                operator = q.operator
                break;
        }

        if (q.field) {
            let label, className = classes.chip
            if (q.field === '<implicit>') {
                label = (
                    <span>
                        {q.prefix && <strong>{q.prefix}{' '}</strong>}
                        {shortenName(q.term)}
                    </span>
                )
            } else if (q.term) {
                label = (
                    <span>
                        {q.prefix && <strong>{q.prefix}{' '}</strong>}
                        <strong>{q.field}</strong>:{' '}
                        {shortenName(q.term)}
                    </span>
                )
                if (SEARCH_QUERY_PREFIXES.includes(q.field)) {
                    className += ' ' + classes.fieldChip
                }
            } else {
                label = lucene.toString(q)
            }

            if (q.similarity || q.proximity || q.boost || q.term?.length > ELLIPSIS_TERM_LENGTH) {
                return (
                    <Tooltip placement="top" title={(
                        <>
                            {q.term?.length > ELLIPSIS_TERM_LENGTH && <Box>{q.term}</Box>}
                            {q.similarity && <Box>Similarity:{' '}{q.similarity}</Box>}
                            {q.proximity && <Box>Proximity:{' '}{q.proximity}</Box>}
                            {q.boost && <Box>Boost:{' '}{q.boost}</Box>}
                        </>
                    )}>
                        {getChip(q, label, className + ' ' + classes.tooltipChip)}
                    </Tooltip>
                )
            }

            return getChip(q, label, className)

        } else if (parentOperator && parentOperator === operator) {

            return (
                q.left && q.right ?
                    <>
                        {build(q.left, operator)}
                        {getNotBox(rightNegation, q.right, build(q.right, operator))}
                    </> :
                q.left ? build(q.left, operator) : null
            )
        } else {

            return (
                q.left && q.right ?
                    <Box className={classes.box}>
                        {getNotBox(leftNegation, q.left, build(q.left, operator))}
                        {getNotBox(rightNegation, q.right, build(q.right, operator))}
                        <ButtonBase
                            className={classes.operator + ' ' + classes[operator]}
                            onClick={handleChipClick(q, operator)}
                        >
                            {operator}
                        </ButtonBase>
                    </Box> :
                q.left ? getNotBox(leftNegation, q.left, build(q.left, operator)) : null
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
