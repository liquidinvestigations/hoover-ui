import { makeAutoObservable } from 'mobx'

import { SearchQueryParams } from '../../Types'
import { defaultSearchParams } from '../../utils/queryUtils'

import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)
    }

    private maskIrrelevantParams = (query: SearchQueryParams): SearchQueryParams => ({
        ...query,
        facets: undefined,
        page: defaultSearchParams.page,
        size: defaultSearchParams.size,
        order: undefined,
    })
}
