import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import CategoryDrawer from './CategoryDrawer'
import CollectionsFilter from './CollectionsFilter'
import { useSearch } from '../SearchProvider'
import Expandable from '../../Expandable'
import CategoryDrawerToolbar from './CategoryDrawerToolbar'
import { useSharedStore } from '../../SharedStoreProvider'

export const Collections = observer(({ openCategory, setOpenCategory, wideFilters, drawerWidth, drawerPinned, setDrawerPinned, drawerPortalRef }) => {
    const { collectionsCount } = useSearch()
    const [searchCollections, setSearchCollections] = useState('')
    const {
        collectionsData,
        searchStore: { query, search },
    } = useSharedStore()

    const handleCollectionsChange = (value) => {
        search({ collections: value })
    }

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
            setPinned={setDrawerPinned}
            portalRef={drawerPortalRef}
            toolbar={
                <CategoryDrawerToolbar
                    search={searchCollections}
                    onSearch={setSearchCollections}
                    drawerPinned={drawerPinned}
                    setDrawerPinned={setDrawerPinned}
                    setOpenCategory={setOpenCategory}
                />
            }>
            <Expandable title={`Collections (${query?.collections?.length || 0})`} open={true} highlight={false}>
                <CollectionsFilter
                    collections={collectionsData}
                    selected={query?.collections || []}
                    changeSelection={handleCollectionsChange}
                    counts={collectionsCount}
                    search={searchCollections}
                />
            </Expandable>
        </CategoryDrawer>
    )
})
