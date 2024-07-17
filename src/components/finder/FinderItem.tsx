import { ListItemButton, ListItemIcon, ListItemText, Theme } from '@mui/material'
import { FC, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'

import { ChildDocument, DocumentData } from '../../Types'
import { getBasePath, getTypeIcon } from '../../utils/utils'
import { useSharedStore } from '../SharedStoreProvider'

import { filenameFor } from './utils'

const useStyles = makeStyles()((theme: Theme) => ({
    item: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
    active: {
        // added !important here in order to override the :hover styling of list items
        // which apply a lighter background color
        backgroundColor: '#1e90ff !important',
        color: '#fff',
    },
    selected: {
        backgroundColor: '#dedede !important',
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

interface FinderItemProps {
    pathname: string
    item: DocumentData | ChildDocument
    active?: DocumentData | ChildDocument
    selected?: DocumentData | ChildDocument
}

export const FinderItem: FC<FinderItemProps> = ({ pathname, item, active, selected }) => {
    const { fullPage } = useSharedStore()
    const { classes, cx } = useStyles()
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const isActive = item.id === active?.id || item.digest === active?.id
    const isSelected = item.id === selected?.id

    useEffect(() => {
        if (ref.current && (isActive || isSelected)) {
            ref.current.scrollIntoView({ block: 'center' })
        }
    }, [isActive, isSelected])

    const handleClick = () => {
        const path = getBasePath(pathname) + ((item as ChildDocument).file || item.id)
        if (!fullPage) {
            window.open(path, '_blank')
        } else {
            navigate(path)
        }
    }

    return (
        <ListItemButton
            ref={ref}
            onClick={handleClick}
            className={cx(classes.item, { [classes.active]: isActive, [classes.selected]: isSelected && !isActive })}>
            <ListItemIcon classes={{ root: classes.iconRoot }}>{getTypeIcon((item as ChildDocument).filetype)}</ListItemIcon>
            <ListItemText classes={{ root: classes.itemRoot, primary: classes.itemText }}>{filenameFor(item)}</ListItemText>
        </ListItemButton>
    )
}
