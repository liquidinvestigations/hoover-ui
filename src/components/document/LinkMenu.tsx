import { Menu, MenuItem } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { mergeWith } from 'lodash'
import { observer } from 'mobx-react-lite'
import { NestedMenuItem } from 'mui-nested-menu'
import qs from 'qs'
import { FC } from 'react'

import { aggregationFields } from '../../constants/aggregationFields'
import { SearchQueryParams, SourceField } from '../../Types'
import { buildSearchQuerystring, createSearchParams, createSearchUrl, rollupParams, Term } from '../../utils/queryUtils'
import { useSharedStore } from '../SharedStoreProvider'

function customizer(objValue: any, srcValue: []) {
    if (Array.isArray(objValue)) {
        return objValue.concat(srcValue)
    }
}

const formats = ['year', 'month', 'week', 'day']

interface LinkMenuProps {
    link: { field: SourceField; term: string }
    anchorPosition: { left: number; top: number } | undefined
    onClose: () => void
}

export const LinkMenu: FC<LinkMenuProps> = observer(({ link, anchorPosition, onClose }) => {
    const { t } = useTranslate()
    const { query, search } = useSharedStore().searchStore
    const {
        hashStore: { hashState },
        documentStore: { collection, digest },
    } = useSharedStore()

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    const getCollections = () => Array.from(new Set([...(query?.collections || []), collection])) as string[]

    const handleAddSearch = (newTab: boolean, term?: string | Term) => () => {
        onClose()

        const newTerm = term || link.term
        const newParams = createSearchParams(newTerm, link?.field as SourceField)
        const mergedParams: Partial<SearchQueryParams> = {}

        if (newParams.filters) {
            mergedParams.filters = mergeWith({}, query?.filters, newParams.filters, customizer)
        }

        if (newParams.q !== '*') {
            mergedParams.q = `${query?.q}\n${newParams.q}`
        } else {
            mergedParams.q = query?.q
        }

        if (newTab) {
            const hashParams = hash ? '#' + qs.stringify(rollupParams(hash)) : ''
            mergedParams.collections = getCollections()
            window.open(`/?${buildSearchQuerystring(mergedParams)}${hashParams}`)
        } else {
            search(mergedParams)
        }
    }

    const handleNewSearch = (term?: string | Term) => () => {
        onClose()
        const newTerm = term || link.term
        window.open(createSearchUrl(newTerm, getCollections(), link?.field as SourceField, hash))
    }

    return (
        <Menu open={!!anchorPosition} onClose={onClose} anchorReference="anchorPosition" anchorPosition={anchorPosition}>
            {
                /*search &&*/
                link && aggregationFields[link.field as SourceField]?.type === 'date' ? (
                    <NestedMenuItem
                        label={t('restrict_current_search_to_this', 'restrict current search to this')}
                        parentMenuOpen={Boolean(anchorPosition)}>
                        {formats.map((format) => (
                            <MenuItem key={format} onClick={handleAddSearch(false, { term: link.term, format })}>
                                {/* @tolgee-ignore */}
                                {t(format).toLowerCase()}
                            </MenuItem>
                        ))}
                    </NestedMenuItem>
                ) : (
                    <MenuItem onClick={handleAddSearch(false)}>
                        <T keyName="add_this_to_current_search">add this field to current search</T>
                    </MenuItem>
                )
            }
            {
                /*search &&*/
                link && aggregationFields[link.field as SourceField]?.type === 'date' ? (
                    <NestedMenuItem
                        label={t('restrict_current_search_to_this_new_tab', 'restrict current search to this (open in a new tab)')}
                        parentMenuOpen={Boolean(anchorPosition)}>
                        {formats.map((format) => (
                            <MenuItem key={format} onClick={handleAddSearch(true, { term: link.term, format })}>
                                {/* @tolgee-ignore */}
                                {t(format).toLowerCase()}
                            </MenuItem>
                        ))}
                    </NestedMenuItem>
                ) : (
                    <MenuItem onClick={handleAddSearch(true)}>
                        <T keyName="add_this_to_current_search_new_tab">add this field to current search (open in new tab)</T>
                    </MenuItem>
                )
            }
            {link && aggregationFields[link.field as SourceField]?.type === 'date' ? (
                <NestedMenuItem label={t('open_new_search_for_this', 'open a new search for this')} parentMenuOpen={Boolean(anchorPosition)}>
                    {formats.map((format) => (
                        <MenuItem key={format} onClick={handleNewSearch({ term: link.term, format })}>
                            {/* @tolgee-ignore */}
                            {t(format).toLowerCase()}
                        </MenuItem>
                    ))}
                </NestedMenuItem>
            ) : (
                <MenuItem onClick={handleNewSearch()}>
                    <T keyName="open_new_search_for_this">open a new search for this term</T>
                </MenuItem>
            )}
        </Menu>
    )
})
