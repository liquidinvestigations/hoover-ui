import React, { memo } from 'react'
import { makeStyles } from '@mui/styles'
import { TreeView } from '@mui/lab'
import Bookmarks from './Bookmarks'
import { reactIcons } from '../../../constants/icons'

const useStyles = makeStyles(theme => ({
    container: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.grey[100],
    }
}))

function BookmarksView ({ expanded, onSetExpanded, onSelect }) {
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
                defaultExpandIcon={reactIcons.chevronRight}
            >
                <Bookmarks onSelect={onSelect} />
            </TreeView>
        </div>
    )
}

export default memo(BookmarksView)
