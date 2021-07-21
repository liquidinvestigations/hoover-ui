import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { ButtonBase, ListItem, ListItemText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { useDocument } from '../DocumentProvider'
import { getBasePath } from '../../../utils'

const filenameFor = item => {
    if (item.filename) {
        return item.filename
    } else {
        const { filename, path } = item.content
        return filename || path.split('/').filter(Boolean).pop() || path || '/'
    }
}

const useStyles = makeStyles(theme => ({
    active: {
        backgroundColor: '#1e90ff',
        color: '#fff',
    },
    selected: {
        backgroundColor: '#dedede',
    },
    itemRoot: {
        margin: 0,
    },
    itemText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
        fontSize: 12,
    },
}))

export default function FinderItem({ item, active, selected }) {
    const classes = useStyles()
    const ref = useRef()
    const router = useRouter()
    const { pathname } = useDocument()
    const isActive = item.id === active.id
    const isSelected = item.id === selected.id

    useEffect(() => {
        if (ref.current && (isActive || isSelected)) {
            ref.current.scrollIntoView({ behavior: isActive ? 'smooth' : 'auto', block: 'center' })
        }
    }, [isActive, isSelected])

    const handleClick = () => {
        router.push(
            getBasePath(pathname) + (item.file || item.id),
            undefined,
            { shallow: true },
        )
    }

    return (
        <ListItem
            ref={ref}
            component={ButtonBase}
            onClick={handleClick}
            className={cn({ [classes.active]: isActive, [classes.selected]: isSelected && !isActive })}
        >
            <ListItemText classes={{ root: classes.itemRoot, primary: classes.itemText }}>
                {filenameFor(item)}
            </ListItemText>
        </ListItem>
    )
}
