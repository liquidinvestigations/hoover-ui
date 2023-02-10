import { TreeView } from '@mui/lab'
import { makeStyles } from '@mui/styles'
import { memo } from 'react'

import { reactIcons } from '../../../constants/icons'

import Bookmarks from './Bookmarks'

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.grey[100],
    },
}))

function BookmarksView({ expanded, onSetExpanded, onSelect }) {
    const classes = useStyles()

    const handleToggle = (event, nodeIds) => {
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

export default memo(BookmarksView)
