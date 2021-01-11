import React, { memo, useEffect, useState } from 'react'
import parser from 'lucene-query-parser'
import { Box, Chip, FormControl } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import { SEARCH_QUERY_PREFIXES } from '../constants'

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
    implicitBox: {

    },
    andBox: {
        '&:after': {
            content: '"AND"',
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
        }
    },
    orBox: {
        '&:after': {
            content: '"OR"',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
        }
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginRight: 0,
        }
    },

    fieldChip: {
        backgroundColor: red.A100,
    }
}))

function SearchQueryChips({ query }) {
    const classes = useStyles()
    const [parsedQuery, setParsedQuery] = useState()

    useEffect(() => {
        try {
            setParsedQuery(parser.parse(query))
        } catch {}
    }, [query])

    const build = q => {
        if (q.field) {
            if (q.field === '<implicit>') {
                return <Chip label={q.term} className={classes.chip} />
            } else if (SEARCH_QUERY_PREFIXES.includes(q.field)) {
                return <Chip label={`${q.field}:${q.term}`} className={classes.chip + ' ' + classes.fieldChip} />
            }
        } else {
            const boxClass = q.operator === 'AND' ? classes.andBox :
                q.operator === 'OR' ? classes.orBox : classes.implicitBox
            return (
                <Box className={classes.box + ' ' + boxClass}>
                    {q.left && build(q.left)}
                    {q.right && build(q.right)}
                </Box>
            )
        }
    }

    return query && parsedQuery ? <FormControl margin="normal">{build(parsedQuery)}</FormControl> : null
}

export default memo(SearchQueryChips)
