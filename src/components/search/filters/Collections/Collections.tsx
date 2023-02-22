import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { Expandable } from '../../../Expandable'
import { useSharedStore } from '../../../SharedStoreProvider'
import { CategoryDrawer } from '../CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from '../CategoryDrawerToolbar/CategoryDrawerToolbar'
import { CollectionsFilter } from '../CollectionsFilter/CollectionsFilter'

export const Collections: FC = observer(() => {
    const { searchCollections } = useSharedStore().searchStore.searchViewStore

    return (
        <CategoryDrawer
            title="Collections"
            icon="categoryCollections"
            highlight={false}
            category="collections"
            toolbar={<CategoryDrawerToolbar category={'collections'} />}>
            <Expandable title={`Collections (${searchCollections.length})`} open={true} highlight={false}>
                <CollectionsFilter />
            </Expandable>
        </CategoryDrawer>
    )
})
