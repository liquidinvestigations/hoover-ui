import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { Expandable } from '../../../common/Expandable/Expandable'
import { useSharedStore } from '../../../SharedStoreProvider'
import { CategoryDrawer } from '../CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from '../CategoryDrawerToolbar/CategoryDrawerToolbar'
import { CollectionsFilter } from '../CollectionsFilter/CollectionsFilter'

export const Collections: FC = observer(() => {
    const { t } = useTranslate()
    const { searchCollections } = useSharedStore().searchStore.searchViewStore

    return (
        <CategoryDrawer
            title={t('collections', 'Collections')}
            icon="categoryCollections"
            highlight={false}
            category="collections"
            toolbar={<CategoryDrawerToolbar category={'collections'} />}
        >
            <Expandable title={t('collections_header', 'Collections ({count})', { count: searchCollections.length })} open={true} highlight={false}>
                <CollectionsFilter />
            </Expandable>
        </CategoryDrawer>
    )
})
