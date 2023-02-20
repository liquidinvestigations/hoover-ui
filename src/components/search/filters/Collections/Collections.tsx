import { observer } from 'mobx-react-lite'
import { FC, RefObject } from 'react'

import { Expandable } from '../../../Expandable'
import { useSharedStore } from '../../../SharedStoreProvider'
import { CategoryDrawer } from '../CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from '../CategoryDrawerToolbar/CategoryDrawerToolbar'
import { CollectionsFilter } from '../CollectionsFilter/CollectionsFilter'

interface CollectionsProps {
    wideFilters: boolean
    drawerWidth: number
    drawerPortalRef: RefObject<HTMLDivElement>
}

export const Collections: FC<CollectionsProps> = observer(({ wideFilters, drawerWidth, drawerPortalRef }) => {
    const {
        searchStore: { drawerPinned, openCategory, setOpenCategory, query },
    } = useSharedStore()

    return (
        <CategoryDrawer
            title="Collections"
            icon="categoryCollections"
            highlight={false}
            category="collections"
            open={openCategory === 'collections'}
            onOpen={setOpenCategory}
            wideFilters={wideFilters}
            width={drawerWidth}
            pinned={drawerPinned}
            portalRef={drawerPortalRef}
            toolbar={<CategoryDrawerToolbar category={'collections'} />}>
            <Expandable title={`Collections (${query?.collections?.length || 0})`} open={true} highlight={false}>
                <CollectionsFilter />
            </Expandable>
        </CategoryDrawer>
    )
})
