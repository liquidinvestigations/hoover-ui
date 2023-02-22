import { makeAutoObservable, runInAction } from 'mobx'
import { Entries } from 'type-fest'

import { aggregationCategories, AggregationField, aggregationFields } from '../../constants/aggregationFields'
import { reactIcons } from '../../constants/icons'
import { Category, SearchQueryParams, SourceField } from '../../Types'
import { getClosestInterval } from '../../utils/utils'

import { SearchStore } from './SearchStore'

interface FilterField extends AggregationField {
    field: SourceField
}

interface CategoryProps {
    label: string
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
                    }),
                })),
            }
            return acc
        },
        {} as Record<Category, CategoryProps>
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
                filters.some(({ field }) => {
                    /*if (!!aggregations?.[field]?.values.buckets.length) {
                        acc[category] = field
                        return true
                    }*/
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
        } else {
            const { [category]: closed, ...expanded } = this.expandedFilters
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

    triggerSearch = (params: Partial<SearchQueryParams>) => {
        this.searchStore.search({ ...params, page: 1 })
    }

    handleChange = (key: string, value: any, resetPage: boolean = false) => {
        const { [key]: prevFilter, ...restFilters } = this.searchStore.query?.filters || {}

        if (resetPage) {
            const { [key]: prevFacet, ...restFacets } = this.searchStore.query?.facets || {}
            this.triggerSearch({ filters: { [key]: value, ...restFilters }, facets: { ...restFacets } })
        } else {
            this.triggerSearch({ filters: { [key]: value, ...restFilters } })
        }
    }

    handleAggregationChange =
        (field: SourceField, value: string, triState: boolean = false) =>
        () => {
            const queryFilter = this.searchStore.query?.filters?.[field]
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

            this.handleChange(field, {
                ...queryFilter,
                include: Array.from(include),
                exclude: Array.from(exclude),
            })
        }

    handleMissingChange = (field: SourceField) => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        if (queryFilter?.missing === 'true') {
            this.handleChange(field, {
                ...queryFilter,
                missing: 'false',
            })
        } else if (queryFilter?.missing === 'false') {
            this.handleChange(field, {
                ...queryFilter,
                missing: undefined,
            })
        } else {
            this.handleChange(field, {
                ...queryFilter,
                missing: 'true',
            })
        }
    }

    handleDateRangeChange = (field: SourceField, range: any) => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { from, to, interval, intervals, ...rest } = queryFilter || {}
        if (range?.from && range?.to) {
            this.handleChange(field, { ...range, interval: getClosestInterval({ ...range, interval }), ...rest }, true)
        } else {
            this.handleChange(field, rest, true)
        }
    }

    handleDateSelectionChange = (field: SourceField, newIntervals: any, resetPage: boolean) => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { intervals, missing, ...rest } = queryFilter || {}
        if (newIntervals.include?.length || newIntervals.missing) {
            this.handleChange(field, { intervals: newIntervals, ...rest }, resetPage)
        } else {
            this.handleChange(field, rest, resetPage)
        }
    }

    handleReset = (field: SourceField) => this.handleChange(field, [], true)
}
