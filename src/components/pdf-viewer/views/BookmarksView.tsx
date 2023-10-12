import { TreeView } from '@mui/lab'
import { FC, SyntheticEvent } from 'react'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../../constants/icons'

import { Bookmarks } from './Bookmarks'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.grey[100],
    },
}))

interface BookmarksViewProps {
    expanded: string[]
    onSetExpanded: (expanded: string[]) => void
    onSelect: (index: number) => void
}

export const BookmarksView: FC<BookmarksViewProps> = ({ expanded, onSetExpanded, onSelect }) => {
    const { classes } = useStyles()

    const handleToggle = (event: SyntheticEvent, nodeIds: string[]) => {
        onSetExpanded(nodeIds)
    }

    return (
        <div className={classes.container}>
            <TreeView
                expanded={expanded}
                onNodeToggle={handleToggle}
                disableSelection={true}
                defaultCollapseIcon={reactIcons.chevronDown}
                defaultExpandIcon={reactIcons.chevronRight}>
                <Bookmarks onSelect={onSelect} />
            </TreeView>
        </div>
    )
}
