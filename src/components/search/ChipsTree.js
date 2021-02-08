import React, { cloneElement, memo, useState } from 'react'
import cn from 'classnames'
import { Box, ButtonBase, Menu, MenuItem } from '@material-ui/core'
import { DEFAULT_OPERATOR } from '../../constants'
import { makeStyles } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
    box: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },
    chips: {
        display: 'flex',
        flexDirection: 'column',
    },
    operator: {
        display: 'block',
        fontSize: '10px',
        width: theme.spacing(1),
        textIndent: theme.spacing(1.5),
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(3.5),
        border: '1px solid black',
        borderLeft: 'none',
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
    notChip: {
        float: 'none',
    },
}))

function ChipsTree({ tree, renderChip, renderMenu, onChipDelete, onExpressionDelete }) {
    const classes = useStyles()

    const [anchorPosition, setAnchorPosition] = useState(null)
    const [isExpression, setExpression] = useState(false)
    const [selectedChip, setSelectedChip] = useState(null)

    const handleChipClick = (chip, parentOperator) => event => {
        setSelectedChip(chip)
        setExpression(!!parentOperator)
        setAnchorPosition({ left: event.clientX, top: event.clientY })
    }

    const handleChipMenuClose = () => {
        setAnchorPosition(null)
    }

    const handleDelete = () => {
        if (isExpression) {
            onExpressionDelete(selectedChip)
        } else {
            onChipDelete(selectedChip)
        }
        handleChipMenuClose()
    }

    const getNotBox = (negation, queryNode, chip, className) => {
        if (negation) {
            return (
                <Box className={cn(classes.box, className)}>
                    {chip}
                    <ButtonBase
                        className={cn(classes.operator, classes.NOT)}
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
            const negation = q.prefix === '-' || q.prefix === '!'
            const chip = getNotBox(negation, q, renderChip(q), classes.notChip)

            return cloneElement(chip, {
                onClick: handleChipClick(q)
            })

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
                        <Box className={classes.chips}>
                            {getNotBox(leftNegation, q.left, build(q.left, operator))}
                            {getNotBox(rightNegation, q.right, build(q.right, operator))}
                        </Box>
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

    return (
        <>
            {build(tree)}
            <Menu
                open={!!anchorPosition}
                onClose={handleChipMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
            >
                <MenuItem onClick={handleDelete}>
                    {renderMenu(isExpression)}
                </MenuItem>
            </Menu>
        </>
    )
}

//export default memo(ChipsTree)
export default ChipsTree
