import { ButtonBase, ListItem, ListItemIcon, ListItemText, Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cx from 'classnames'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef } from 'react'

import { ChildDocument, DocumentData } from '../../../stores/DocumentStore'
import { getBasePath, getTypeIcon } from '../../../utils/utils'

import { filenameFor } from './utils'

const useStyles = makeStyles((theme: Theme) => ({
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

interface FinderItemProps {
    pathname: string
    item: DocumentData | ChildDocument
    active?: DocumentData | ChildDocument
    selected?: DocumentData | ChildDocument
}

export const FinderItem: FC<FinderItemProps> = ({ pathname, item, active, selected }) => {
    const classes = useStyles()
    const ref = useRef<HTMLLIElement>(null)
    const router = useRouter()
    const isActive = item.id === active?.id
    const isSelected = item.id === selected?.id

    useEffect(() => {
        if (ref.current && (isActive || isSelected)) {
            ref.current.scrollIntoView({ block: 'center' })
        }
    }, [isActive, isSelected])

    const handleClick = () => {
        router.push(getBasePath(pathname) + ((item as any).file || item.id), undefined, { shallow: true })
    }

    return (
        <ListItem
            ref={ref}
            component={ButtonBase as any}
            onClick={handleClick}
            className={cx(classes.item, { [classes.active]: isActive, [classes.selected]: isSelected && !isActive })}>
            <ListItemIcon classes={{ root: classes.iconRoot }}>{getTypeIcon((item as any).filetype)}</ListItemIcon>
            <ListItemText classes={{ root: classes.itemRoot, primary: classes.itemText }}>{filenameFor(item)}</ListItemText>
        </ListItem>
    )
}
