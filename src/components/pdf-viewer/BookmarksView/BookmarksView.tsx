import { TreeView } from '@mui/lab'
import { observer } from 'mobx-react-lite'
import { FC, SyntheticEvent } from 'react'

import { reactIcons } from '../../../constants/icons'
import { useSharedStore } from '../../SharedStoreProvider'
import { Bookmarks } from '../Bookmarks'

import { useStyles } from './BookmarksView.styles'

export const BookmarksView: FC = observer(() => {
    const { classes } = useStyles()
    const { expandedBookmarks, setExpandedBookmarks } = useSharedStore().pdfViewerStore

    const handleToggle = (event: SyntheticEvent, nodeIds: string[]) => {
        setExpandedBookmarks(nodeIds)
    }

    return (
        <div className={classes.container}>
            <TreeView
                expanded={expandedBookmarks}
                onNodeToggle={handleToggle}
                disableSelection={true}
                defaultCollapseIcon={reactIcons.chevronDown}
                defaultExpandIcon={reactIcons.chevronRight}>
                <Bookmarks />
            </TreeView>
        </div>
    )
})
