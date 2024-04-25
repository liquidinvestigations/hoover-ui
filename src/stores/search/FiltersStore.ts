import lucene, { AST, BinaryAST, Node, NodeRangedTerm, NodeTerm } from 'lucene'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { ReactElement } from 'react'
import { Entries } from 'type-fest'

import { aggregationCategories, AggregationField, aggregationFields } from '../../constants/aggregationFields'
import { reactIcons } from '../../constants/icons'
import { AggregationsKey, Category, SearchQueryParams, SourceField, Terms } from '../../Types'
import { clearQuotedParam, defaultSearchParams } from '../../utils/queryUtils'
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

    parsedFilters: AST | undefined

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () => searchStore.query?.filters,
            (filters) => {
                if (filters) {
                    const filtersArray = Object.entries(filters)
                        .map(([key, values]) => this.processFilter(key as SourceField, values))
                        .filter((filter) => filter !== '')

                    this.parsedFilters = filtersArray.length ? lucene.parse(filtersArray.join(' AND ')) : undefined
                } else {
                    this.parsedFilters = undefined
                }
            },
        )

        this.expandedFilters = this.initExpandedFilters()
    }

    private deleteFilterNode = (filters: Record<string, Terms>, node: Node): Record<string, Terms> => {
        const nodeTerm = node as NodeTerm & NodeRangedTerm

        if (this.isDateField(node.field)) {
            this.processDateField(filters, nodeTerm)
        } else if (nodeTerm.term) {
            this.processNonDateField(filters, nodeTerm)
        }

        return filters
    }

    private isDateField = (field: SourceField | string): boolean => {
        return aggregationFields[field as SourceField]?.type === 'date'
    }

    private processDateField = (filters: Record<string, Terms>, nodeTerm: NodeTerm & NodeRangedTerm): void => {
        const termList = filters[nodeTerm.field].intervals?.include

        this.removeFromList(termList, nodeTerm.term as SourceField)

        if (nodeTerm.term_min && nodeTerm.term_max) {
            filters[nodeTerm.field].from = undefined
            filters[nodeTerm.field].to = undefined
        }

        if (nodeTerm.boost === 1 && filters[nodeTerm.field].intervals?.missing) {
            filters[nodeTerm.field].intervals!.missing = undefined
        }
    }

    private processNonDateField = (filters: Record<string, Terms>, nodeTerm: NodeTerm & NodeRangedTerm): void => {
        const filter = filters[nodeTerm.field] as Terms

        this.removeFromList(filter.include, nodeTerm.term as SourceField)
        this.removeFromList(filter.exclude, nodeTerm.term as SourceField)

        if (nodeTerm.boost === 1 && filter.missing) {
            filter.missing = undefined
        }
    }

    private removeFromList = (list: SourceField[] | undefined, term: SourceField): void => {
        const index = list?.indexOf(term)
        if (index !== undefined && index > -1 && list) {
            list.splice(index, 1)
        }
    }

    private deleteFilterOperands = (filters: Record<string, Terms>, node: AST | Node) => {
        if (node.field) {
            this.deleteFilterNode(filters, node as NodeTerm)
        }

        if ((node as AST).left) {
            this.deleteFilterOperands(filters, (node as AST).left)
        }

        if ((node as BinaryAST).right) {
            this.deleteFilterOperands(filters, (node as BinaryAST).right)
        }

        return filters
    }

    private createRangeFilter = (key: SourceField, values: Terms): string => {
        if (values.from && values.to) {
            return `(${key}:[${values.from} TO ${values.to}])`
        }
        return ''
    }

    private createIntervalFilter = (key: SourceField, values: Terms): string => {
        if (!values.intervals) return ''
        const intervalsArray: string[] = []

        if (values.intervals.missing === 'true') {
            intervalsArray.push(`(${key}:"N/A"^1)`)
        }

        values.intervals.include?.forEach((value) => {
            intervalsArray.push(`${key}:${value}`)
        })

        return intervalsArray.length ? `(${intervalsArray.join(' OR ')})` : ''
    }

    private createIncludeFilter = (key: SourceField, values: Terms): string => {
        if (!values.include?.length) return ''
        const includeOperator = aggregationFields[key]?.type === 'term-and' ? ' AND ' : ' OR '
        const includeArray = values.include.map((value) => `${key}:"${clearQuotedParam(value)}"`)

        return includeArray.length > 1 ? `(${includeArray.join(includeOperator)})` : `${includeArray[0]}`
    }

    private createExcludeFilter = (key: SourceField, values: Terms): string => {
        if (!values.exclude?.length) return ''
        const excludeArray = values.exclude.map((value) => `(${key}:-"${clearQuotedParam(value)}")`)

        return excludeArray.length > 1 ? `(${excludeArray.join(' AND ')})` : `${excludeArray[0]}`
    }

    processFilter = (key: SourceField, values: Terms): string => {
        const rangeFilter = this.createRangeFilter(key, values)
        const intervalFilter = this.createIntervalFilter(key, values)
        const includeFilter = this.createIncludeFilter(key, values)
        const excludeFilter = this.createExcludeFilter(key, values)

        return [rangeFilter, intervalFilter, includeFilter, excludeFilter].filter((filter) => filter !== '').join(' AND ')
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
        this.searchStore.navigateSearch({ ...params, page: defaultSearchParams.page }, { keepFromClearing })
    }

    handleChange = (key: SourceField, value: Terms, resetPage: boolean = false) => {
        const { [key]: _prevFilter, ...restFilters } = this.searchStore.query?.filters ?? {}

        if (resetPage) {
            const { [key]: _prevFacet, ...restFacets } = this.searchStore.query?.facets ?? {}
            this.triggerSearch({ filters: { [key]: value, ...restFilters }, facets: { ...restFacets } }, key as AggregationsKey)
        } else {
            this.triggerSearch({ filters: { [key]: value, ...restFilters } }, key as AggregationsKey)
        }
    }

    private processFilterParams = (queryFilter: Terms, value: SourceField, triState: boolean = false) => {
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

    private processFilterMissing = (queryFilter: Terms) => {
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
        (field: SourceField, value: SourceField, triState: boolean = false) =>
        () => {
            const queryFilter = this.searchStore.query?.filters?.[field] ?? {}
            const { include, exclude } = this.processFilterParams(queryFilter, value, triState)

            this.handleChange(field, {
                ...queryFilter,
                include,
                exclude,
            })
        }

    handleMissingChange = (field: SourceField) => () => {
        const queryFilter = this.searchStore.query?.filters?.[field] ?? {}
        this.handleChange(field, {
            ...queryFilter,
            missing: queryFilter?.missing ? undefined : this.processFilterMissing(queryFilter).missing ? 'true' : 'false',
        })
    }

    handleDateRangeChange = (field: SourceField) => (range?: { from?: string; to?: string }) => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { from: _from, to: _to, interval, intervals: _intervals, ...rest } = queryFilter || {}
        if (range?.from && range?.to && interval) {
            this.handleChange(field, { ...range, interval: getClosestInterval({ ...range, interval }), ...rest }, true)
        } else {
            this.handleChange(field, rest, true)
        }
    }

    handleDateSelectionChange = (field: SourceField, value: SourceField, resetPage?: boolean) => () => {
        const queryFilter = this.searchStore.query?.filters?.[field]
        const { intervals, missing: _missing, ...rest } = queryFilter || {}
        const newIntervals = this.processFilterParams(intervals!, value)
        if (newIntervals.include?.length) {
            this.handleChange(field, { intervals: newIntervals, ...rest }, resetPage)
        } else {
            this.handleChange(field, rest, resetPage)
        }
    }

    handleFilterChipDelete = (node: AST | Node) => {
        this.searchStore.navigateSearch({ filters: this.deleteFilterOperands({ ...this.searchStore.query?.filters }, node) })
    }

    handleReset = (field: SourceField) => () => {
        const { [field]: _prevFilter, ...restFilters } = this.searchStore.query?.filters ?? {}
        const { [field]: _prevFacet, ...restFacets } = this.searchStore.query?.facets ?? {}

        this.triggerSearch({ filters: { [field]: [] as Terms, ...restFilters }, facets: { ...restFacets } })
    }

    loadMissing = (field: SourceField) => {
        if (!this.searchStore.searchMissingStore.missing[`${field}-missing`]) {
            this.searchStore.navigateSearch(undefined, { searchType: SearchType.Missing, fieldList: [field] })
        }
    }
}
