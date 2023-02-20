import { observer } from 'mobx-react-lite'
import { FC, RefObject, useState } from 'react'

import { Expandable } from '../../Expandable'
import { useSharedStore } from '../../SharedStoreProvider'

import { CategoryDrawer } from './CategoryDrawer'
import CategoryDrawerToolbar from './CategoryDrawerToolbar'
import CollectionsFilter from './CollectionsFilter'

import type { Category } from '../../../Types'

interface CollectionsProps {
    wideFilters: boolean
    drawerWidth: number
    drawerPortalRef: RefObject<HTMLDivElement>
}

export const Collections: FC<CollectionsProps> = observer(({ wideFilters, drawerWidth, drawerPortalRef }) => {
    const [searchCollections, setSearchCollections] = useState('')
    const {
        collectionsData,
        searchStore: { drawerPinned, setDrawerPinned, openCategory, setOpenCategory, query, search },
    } = useSharedStore()

    const handleCollectionsChange = (value: Category[]) => {
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
                    counts={collectionsData}
                    search={searchCollections}
                />
            </Expandable>
        </CategoryDrawer>
    )
})
