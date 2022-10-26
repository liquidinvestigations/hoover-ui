import React from 'react'
import qs from 'qs'
import { mergeWith } from 'lodash'
import { Menu, MenuItem } from '@mui/material'
import { NestedMenuItem } from 'mui-nested-menu'
import { useDocument } from './DocumentProvider'
import { useSearch } from '../search/SearchProvider'
import { useHashState } from '../HashStateProvider'
import { buildSearchQuerystring, createSearchParams, createSearchUrl, rollupParams } from '../../queryUtils'
import { aggregationFields } from '../../constants/aggregationFields'

function customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

const formats = ['year', 'month', 'week', 'day']

export default function LinkMenu({ link, anchorPosition, onClose }) {
    const { hashState } = useHashState()
    const { query, search } = useSearch()
    const { collection, digest } = useDocument()

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    const getCollections = () => Array.from(new Set([...(query?.collections || []), collection]))

    const handleAddSearch = (newTab = false, term) => () => {
        onClose()

        const newTerm = term || link.term
        const newParams = createSearchParams(link.field, newTerm)
        const mergedParams = {}

        if (newParams.filters) {
            mergedParams.filters = mergeWith({}, query.filters, newParams.filters, customizer)
        }

        if (newParams.q !== '*') {
            mergedParams.q = `${query.q}\n${newParams.q}`
        } else {
            mergedParams.q = query.q
        }

        if (newTab) {
            const hashParams = hash ? '#' + qs.stringify(rollupParams(hash)) : ''
            mergedParams.collections = getCollections()
            window.open(`/?${buildSearchQuerystring(mergedParams)}${hashParams}`)
        } else {
            search(mergedParams)
        }
    }

    const handleNewSearch = term => () => {
        onClose()
        const newTerm = term || link.term
        window.open(createSearchUrl(newTerm, link.field, getCollections(), hash))
    }

    return (
        <Menu
            open={!!anchorPosition}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
        >
            {search && (
                aggregationFields[link?.field]?.type === 'date' ?
                    <NestedMenuItem
                        label="restrict current search to this"
                        parentMenuOpen={Boolean(anchorPosition)}
                    >
                        {formats.map(format =>
                            <MenuItem
                                key={format}
                                onClick={handleAddSearch(false, { term: link.term, format })}
                            >
                                {format}
                            </MenuItem>
                        )}
                    </NestedMenuItem>
                    :
                    <MenuItem onClick={handleAddSearch(false)}>
                        add this field to current search
                    </MenuItem>
            )}
            {search && (
                aggregationFields[link?.field]?.type === 'date' ?
                    <NestedMenuItem
                        label="restrict current search to this (open in a new tab)"
                        parentMenuOpen={Boolean(anchorPosition)}
                    >
                        {formats.map(format =>
                            <MenuItem
                                key={format}
                                onClick={handleAddSearch(true, { term: link.term, format })}
                            >
                                {format}
                            </MenuItem>
                        )}
                    </NestedMenuItem>
                    :
                    <MenuItem onClick={handleAddSearch(true)}>
                        add this field to current search (open in new tab)
                    </MenuItem>
            )}
            {aggregationFields[link?.field]?.type === 'date' ?
                <NestedMenuItem
                    label="open a new search for this"
                    parentMenuOpen={Boolean(anchorPosition)}
                >
                    {formats.map(format =>
                        <MenuItem
                            key={format}
                            onClick={handleNewSearch({ term: link.term, format })}
                        >
                            {format}
                        </MenuItem>
                    )}
                </NestedMenuItem>
                :
                <MenuItem onClick={handleNewSearch()}>
                    open a new search for this term
                </MenuItem>
            }
        </Menu>
    )
}
