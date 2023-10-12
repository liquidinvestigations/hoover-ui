import { AST, Node } from 'lucene'
import { makeAutoObservable, runInAction } from 'mobx'
import { ReactElement } from 'react'
import { Entries } from 'type-fest'

import { deleteFilterOperands } from '../../components/search/filters/FiltersChips/utils'
import { aggregationCategories, AggregationField, aggregationFields } from '../../constants/aggregationFields'
import { reactIcons } from '../../constants/icons'
import { AggregationsKey, Category, SearchQueryParams, SourceField } from '../../Types'
import { defaultSearchParams } from '../../utils/queryUtils'
import { getClosestInterval } from '../../utils/utils'

import { SearchStore, SearchType } from './SearchStore'

interface FilterField extends AggregationField {
    field: SourceField
}

interface CategoryProps {
    label: ReactElement | string
    icon: keyof typeof reactIcons
    filters: FilterField[]
}

interface ExpandedFilters {
    [category: string]: SourceField
}

export class FiltersStore {
    categories = (Object.entries(aggregationCategories) as Entries<typeof aggregationCategories>).reduce(
        (acc, [category, { label, icon, filters }]) => {
            acc[category] = {
                label,
                icon,
                filters: filters.map((field) => ({
                    field,
                    ...(aggregationFields[field] || {
                        filterLabel: field,
                        chipLabel: field,
                        type: 'term-and',
                        sort: true,
                    }),
                })),
            }
            return acc
        },
        {} as Record<Category, CategoryProps>,
    )

    expandedFilters: ExpandedFilters

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        this.expandedFilters = this.initExpandedFilters()
    }

    initExpandedFilters = () => {
        return Object.entries(this.categories).reduce((acc, [category, { filters }]) => {
            if (!acc[category]) {
                filters.some(({ field }) => {
                    const queryFilter = this.searchStore.query?.filters?.[field]
                    if (
                        !!queryFilter?.include?.length ||
                        !!queryFilter?.exclude?.length ||
                        !!queryFilter?.missing ||
                        !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)
                    ) {
                        acc[category] = field
                        return true
                    }
                })
            }

            if (!acc[category]) {
                acc[category] = filters[0].field
            }

            return acc
        }, {} as ExpandedFilters)
    }

    setExpandedFilters = (expandedFilters: ExpandedFilters) => {
        runInAction(() => {
            this.expandedFilters = expandedFilters
        })
    }

    onExpandToggle = (category: Category, field: SourceField) => (open: boolean) => {
        if (open) {
            this.setExpandedFilters({ ...this.expandedFilters, ...{ [category]: field } })
            this.loadMissing(field)
        } else {
            const { [category]: _closed, ...expanded } = this.expandedFilters
            this.setExpandedFilters(expanded)
        }
    }

    isHighlighted = (filters: FilterField[]) =>
        filters.some((filter) => {
            const queryFilter = this.searchStore.query?.filters?.[filter.field]

            return (
                !!queryFilter?.include?.length ||
                !!queryFilter?.exclude?.length ||
                !!queryFilter?.missing ||
                !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)
            )
        })

    triggerSearch = (params: Partial<SearchQueryParams>, keepFromClearing?: AggregationsKey) => {
        this.searchStore.search({ ...params, page: defaultSearchParams.page }, { keepFromClearing })
    }

    handleChange = (key: string, value: any, resetPage: boolean = false) => {
        const { [key]: _prevFilter, ...restFilters } = this.searchStore.query?.filters ?? {}

        if (resetPage) {
            const { [key]: _prevFacet, ...restFacets } = this.searchStore.query?.facets ?? {}
            this.triggerSearch({ filters: { [key]: value, ...restFilters }, facets: { ...restFacets } }, key as AggregationsKey)
        } else {
            this.triggerSearch({ filters: { [key]: value, ...restFilters } }, key as AggregationsKey)
        }
    }

    private processFilterParams = (queryFilter: any, value: any, triState: boolean = false) => {
        const include = new Set(queryFilter?.include || [])
        const exclude = new Set(queryFilter?.exclude || [])

        if (include.has(value)) {
            include.delete(value)
            if (triState) {
                exclude.add(value)
            }
        } else if (exclude.has(value)) {
            exclude.delete(value)
        } else {
            include.add(value)
        }

        return {
            include: Array.from(include),
            exclude: Array.from(exclude),
        }
    }

    private processFilterMissing = (queryFilter: any) => {
        let missing

        if (queryFilter?.missing === 'true') {
            missing = false
        } else if (queryFilter?.missing === 'false') {
            missing = undefined
        } else {
            missing = true
        }

        return { missing }
    }

    handleAggregationChange =
        (field: SourceField, value: any, triState: boolean = false) =>
        () => {
            const queryFilter = this.searchStore.query?.filters?.[field]
            const { include, exclude } = this.processFilterParams(queryFilter, value, triState)

            this.handleChange(field, {
                ...queryFilter,
                include,
                exclude,
            })
        }

    handleMissingChange = (field: SourceField) => () => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        this.handleChange(field, {
            ...queryFilter,
            missing: this.processFilterMissing(queryFilter),
        })
    }

    handleDateRangeChange = (field: SourceField) => (range?: { from?: string; to?: string }) => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { _from, _to, interval, _intervals, ...rest } = queryFilter || {}
        if (range?.from && range?.to) {
            this.handleChange(field, { ...range, interval: getClosestInterval({ ...range, interval }), ...rest }, true)
        } else {
            this.handleChange(field, rest, true)
        }
    }

    handleDateSelectionChange = (field: SourceField, value: string, resetPage: boolean) => () => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { intervals, _missing, ...rest } = queryFilter || {}
        const newIntervals = this.processFilterParams(intervals, value)
        if (newIntervals.include?.length /*|| newIntervals.missing*/) {
            this.handleChange(field, { intervals: newIntervals, ...rest }, resetPage)
        } else {
            this.handleChange(field, rest, resetPage)
        }
    }

    handleFilterChipDelete = (node: AST | Node) => {
        this.searchStore.search({ filters: deleteFilterOperands({ ...this.searchStore.query?.filters }, node) })
    }

    handleReset = (field: SourceField) => () => {
        const { [field]: _prevFilter, ...restFilters } = this.searchStore.query?.filters ?? {}
        const { [field]: _prevFacet, ...restFacets } = this.searchStore.query?.facets ?? {}

        this.triggerSearch({ filters: { [field]: [], ...restFilters }, facets: { ...restFacets } })
    }

    loadMissing = (field: SourceField) => {
        if (!this.searchStore.searchMissingStore.missing[`${field}-missing`]) {
            this.searchStore.search(undefined, { searchType: SearchType.Missing, fieldList: [field] })
        }
    }
}
