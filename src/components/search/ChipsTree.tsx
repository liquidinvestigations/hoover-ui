import { Box, ButtonBase, Menu, MenuItem, Theme } from '@mui/material'
import { red } from '@mui/material/colors'
import { AST, Node, NodeTerm, Operator } from 'lucene'
import { cloneElement, FC, useState, MouseEvent } from 'react'
import { makeStyles } from 'tss-react/mui'

import { DEFAULT_OPERATOR } from '../../constants/general'

const useStyles = makeStyles()((theme: Theme) => ({
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
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
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

interface AnchorPosition {
    left: number
    top: number
}

interface ChipsTreeProps {
    tree: AST
    renderChip: (term: NodeTerm) => JSX.Element
    renderMenu: (isExpression: boolean) => string
    onChipDelete: (chip: AST | Node) => void
    onExpressionDelete: (chip: AST | Node) => void
}

export const ChipsTree: FC<ChipsTreeProps> = ({ tree, renderChip, renderMenu, onChipDelete, onExpressionDelete }) => {
    const { classes, cx } = useStyles()

    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>()
    const [isExpression, setExpression] = useState(false)
    const [selectedChip, setSelectedChip] = useState<AST | Node>()

    const handleChipClick = (chip: AST | Node, parentOperator?: Operator) => (event: MouseEvent) => {
        setSelectedChip(chip)
        setExpression(!!parentOperator)
        setAnchorPosition({ left: event.clientX, top: event.clientY })
    }

    const handleChipMenuClose = () => {
        setAnchorPosition(undefined)
    }

    const handleDelete = () => {
        if (isExpression) {
            selectedChip && onExpressionDelete(selectedChip)
        } else {
            selectedChip && onChipDelete(selectedChip)
        }
        handleChipMenuClose()
    }

    const getNotBox = (negation: boolean, queryNode: AST | Node, chip: JSX.Element | null, className?: string) => {
        if (negation) {
            return (
                <Box className={cx(classes.box, className)}>
                    {chip}
                    <ButtonBase className={cx(classes.operator, classes.NOT)} onClick={handleChipClick(queryNode, 'NOT')}>
                        NOT
                    </ButtonBase>
                </Box>
            )
        }
        return chip
    }

    const build = (q: AST | Node, parentOperator?: Operator): JSX.Element | null => {
        let operator: 'AND' | 'OR',
            leftNegation = 'start' in q && q.start === 'NOT',
            rightNegation = false

        switch ('operator' in q ? q.operator : '') {
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
                operator = 'operator' in q ? (q.operator as 'AND' | 'OR') : DEFAULT_OPERATOR
                break
            default:
                operator = DEFAULT_OPERATOR
        }

        if (q.field) {
            const negation = 'prefix' in q && (q.prefix === '-' || q.prefix === '!')
            const chip = getNotBox(negation, q, renderChip(q as NodeTerm), classes.notChip)

            return (
                chip &&
                cloneElement(chip, {
                    onClick: handleChipClick(q),
                })
            )
        } else if (parentOperator && parentOperator === operator) {
            return 'left' in q && 'right' in q && q.left && q.right ? (
                <>
                    {build(q.left, operator)}
                    {getNotBox(rightNegation, q.right, build(q.right, operator))}
                </>
            ) : 'left' in q && q.left ? (
                build(q.left, operator)
            ) : null
        } else {
            return 'left' in q && 'right' in q && q.left && q.right ? (
                <Box className={classes.box}>
                    <Box className={classes.chips}>
                        {getNotBox(leftNegation, q.left, build(q.left, operator))}
                        {getNotBox(rightNegation, q.right, build(q.right, operator))}
                    </Box>
                    <ButtonBase className={classes.operator + ' ' + classes[operator]} onClick={handleChipClick(q, operator)}>
                        {operator}
                    </ButtonBase>
                </Box>
            ) : 'left' in q && q.left ? (
                getNotBox(leftNegation, q.left, build(q.left, operator))
            ) : null
        }
    }

    return (
        <>
            {build(tree)}
            <Menu open={!!anchorPosition} onClose={handleChipMenuClose} anchorReference="anchorPosition" anchorPosition={anchorPosition}>
                <MenuItem onClick={handleDelete}>{renderMenu(isExpression)}</MenuItem>
            </Menu>
        </>
    )
}
