import React, { memo, useEffect, useState } from 'react'
import lucene from 'lucene'
import { Box, Chip, FormControl, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { blue, green, red } from '@material-ui/core/colors'
import { DEFAULT_OPERATOR, SEARCH_QUERY_PREFIXES } from '../constants'

const useStyles = makeStyles(theme => ({
    box: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginRight: 0,
        },

        '&:after': {
            content: '""',
            display: 'block',
            textAlign: 'center',
            lineHeight: '30px',
            fontSize: '10px',
            height: theme.spacing(1),
            marginTop: theme.spacing(1) / 2,
            borderLeft: '1px solid black',
            borderRight: '1px solid black',
            borderBottom: 'solid 1px black',
        }
    },
    AND: {
        '&:after': {
            content: '"AND"',
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
        }
    },
    OR: {
        '&:after': {
            content: '"OR"',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
        }
    },
    'AND-NOT': {
        '&:after': {
            content: '"AND NOT"',
            color: red.A700,
            borderColor: red.A700,
        }
    },
    'OR-NOT': {
        '&:after': {
            content: '"OR NOT"',
            color: blue.A700,
            borderColor: blue.A700,
        }
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
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

function SearchQueryChips({ query }) {
    const classes = useStyles()
    const [parsedQuery, setParsedQuery] = useState()

    useEffect(() => {
        try {
            setParsedQuery(lucene.parse(query))
        } catch {}
    }, [query])

    const build = (q, parentOperator) => {
        const operator = q.operator === '<implicit>' ? DEFAULT_OPERATOR : q.operator?.replace(' ', '-')
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
                        <Chip label={label} className={className + ' ' + classes.tooltipChip} />
                    </Tooltip>
                )
            }

            return <Chip label={label} className={className} />

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
                    <Box className={classes.box + ' ' + classes[operator]}>
                        {build(q.left, operator)}
                        {build(q.right, operator)}
                    </Box> :
                q.left ? build(q.left, operator) : null
            )
        }
    }

    return query && parsedQuery ? <FormControl margin="normal">{build(parsedQuery)}</FormControl> : null
}

export default memo(SearchQueryChips)
