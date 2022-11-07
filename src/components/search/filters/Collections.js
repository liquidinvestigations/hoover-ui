import { useCallback, useState } from 'react'
import CategoryDrawer from './CategoryDrawer'
import CollectionsFilter from './CollectionsFilter'
import { useSearch } from '../SearchProvider'
import Expandable from '../../Expandable'
import CategoryDrawerToolbar from './CategoryDrawerToolbar'

export default function Collections({
    collections,
    openCategory,
    setOpenCategory,
    wideFilters,
    drawerWidth,
    drawerPinned,
    setDrawerPinned,
    drawerPortalRef,
}) {
    const { query, search, collectionsCount } = useSearch()
    const [searchCollections, setSearchCollections] = useState('')

    const handleCollectionsChange = useCallback(
        (value) => {
            search({ collections: value, page: 1 })
        },
        [collections, search]
    )

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
            <Expandable title={`Collections (${query.collections?.length || 0})`} open={true} highlight={false}>
                <CollectionsFilter
                    collections={collections}
                    selected={query.collections || []}
                    changeSelection={handleCollectionsChange}
                    counts={collectionsCount}
                    search={searchCollections}
                />
            </Expandable>
        </CategoryDrawer>
    )
}
