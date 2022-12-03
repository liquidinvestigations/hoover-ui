import { makeAutoObservable } from 'mobx'
import { SearchStore } from './SearchStore'
import { search as searchAPI } from '../../utils/api'
import { SearchQueryParams } from '../../Types'

export class SearchResultsStore {
    results: any

    resultsTask: any

    resultsLoading = false

    error: any

    searchStore: SearchStore

    constructor(searchStore: SearchStore) {
        this.searchStore = searchStore

        makeAutoObservable(this)
    }

    maskIrrelevantParams = (query: SearchQueryParams): SearchQueryParams => ({
        ...query,
        facets: undefined,
        filters: {
            ...(query.filters || {}),
            date: {
                from: query.filters?.date?.from,
                to: query.filters?.date?.to,
                intervals: query.filters?.date?.intervals,
            },
            ['date-created']: {
                from: query.filters?.['date-created']?.from,
                to: query.filters?.['date-created']?.to,
                intervals: query.filters?.['date-created']?.intervals,
            },
        },
    })

    resultsQueryDiffer = (query?: SearchQueryParams): boolean => {
        if (query && !this.searchStore.query) {
            return true
        } else if (query && this.searchStore.query) {
            return JSON.stringify(this.maskIrrelevantParams(query)) !== JSON.stringify(this.maskIrrelevantParams(this.searchStore.query))
        }
        return false
    }

    runQueryTask = async () => {
        try {
            const taskData = await searchAPI({
                ...this.searchStore.query,
                type: 'results',
                fieldList: '*',
                async: true,
            })

            this.resultsTask = { ...taskData, initialEta: taskData.eta?.total_sec }
        } catch (error) {
            //handleResultsError(error)
        }
    }
}
