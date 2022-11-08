import { useEffect, useRef } from 'react'
import cn from 'classnames'
import { ButtonBase, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useRouter } from 'next/router'
import { getBasePath, getTypeIcon } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'

const filenameFor = (item) => {
    if (item.filename) {
        return item.filename
    } else {
        const { filename, path } = item.content
        return filename || path.split('/').filter(Boolean).pop() || path || '/'
    }
}

const useStyles = makeStyles((theme) => ({
    item: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
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
    iconRoot: {
        minWidth: 26,
        '& *': {
            fontSize: 18,
        },
    },
}))

export default function FinderItem({ item, active, selected }) {
    const classes = useStyles()
    const ref = useRef()
    const router = useRouter()
    const { pathname } = useSharedStore().documentStore
    const isActive = item.id === active.id
    const isSelected = item.id === selected.id

    useEffect(() => {
        if (ref.current && (isActive || isSelected)) {
            ref.current.scrollIntoView({ block: 'center' })
        }
    }, [isActive, isSelected])

    const handleClick = () => {
        router.push(getBasePath(pathname) + (item.file || item.id), undefined, { shallow: true })
    }

    return (
        <ListItem
            ref={ref}
            component={ButtonBase}
            onClick={handleClick}
            className={cn(classes.item, { [classes.active]: isActive, [classes.selected]: isSelected && !isActive })}>
            <ListItemIcon classes={{ root: classes.iconRoot }}>{getTypeIcon(item.filetype)}</ListItemIcon>
            <ListItemText classes={{ root: classes.itemRoot, primary: classes.itemText }}>{filenameFor(item)}</ListItemText>
        </ListItem>
    )
}
