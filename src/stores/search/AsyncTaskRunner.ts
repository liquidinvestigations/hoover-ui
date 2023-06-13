import { makeAutoObservable, runInAction } from 'mobx'

import { asyncSearch as asyncSearchAPI } from '../../backend/api'
import { AsyncTaskData, SearchQueryParams, SearchQueryType, SourceField } from '../../Types'

interface FetchParams extends SearchQueryParams {
    type: SearchQueryType
    async?: boolean
    missing?: boolean
    fieldList: SourceField[] | '*'
}

export class AsyncQueryTask {
    running: boolean = false
    initialEta?: number
    data?: AsyncTaskData
    timeout?: NodeJS.Timeout
    controller?: AbortController

    constructor(readonly query: SearchQueryParams, private readonly type: SearchQueryType, private readonly fieldList: SourceField[] | '*') {
        makeAutoObservable(this)
    }

    async run() {
        if (!this.running) {
            this.running = true

            const params: FetchParams = {
                ...this.query,
                type: this.type,
                fieldList: this.fieldList,
                async: true,
            }

            if (this.type === 'missing') {
                params.type = 'aggregations'
                params.missing = true
            }

            this.controller = new AbortController()
            const signal = this.controller.signal

            const response = await fetch('/api/search', {
                signal,
                method: 'POST',
                body: JSON.stringify(params),
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            })

            if (!response.ok) {
                const json = await response.json()
                throw new Error(json.reason || json.message || `HTTP ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            runInAction(() => {
                this.data = data
            })

            if (this.data && this.data.status !== 'done') {
                this.initialEta = this.data.eta.total_sec
                await this.handleQueryResult()
            }
        }
    }

    async handleQueryResult() {
        if (!this.data || !this.initialEta) return

        const wait = (this.data.eta.total_sec as number) < parseInt(process.env.ASYNC_SEARCH_POLL_INTERVAL as string)
        const data = await asyncSearchAPI(this.data.task_id, wait)
        runInAction(() => {
            this.data = data
        })

        if (this.data && this.data.status !== 'done') {
            if (Date.now() - Date.parse(this.data.date_created) < this.timeoutMs) {
                this.timeout = setTimeout(this.handleQueryResult, parseInt(process.env.ASYNC_SEARCH_POLL_INTERVAL as string) * 1000)
            } else {
                throw new Error('Results task ETA timeout')
            }
        }
    }

    get timeoutMs() {
        return (
            (this.initialEta || 0) * parseInt(process.env.ASYNC_SEARCH_ERROR_MULTIPLIER as string) +
            parseInt(process.env.ASYNC_SEARCH_ERROR_SUMMATION as string) * 1000
        )
    }
}

export class AsyncQueryTaskRunner {
    static taskQueue: AsyncQueryTask[] = []

    static createAsyncQueryTask(query: SearchQueryParams, type: SearchQueryType, fieldList: SourceField[] | '*'): AsyncQueryTask {
        const task = new AsyncQueryTask(query, type, fieldList)

        this.taskQueue.push(task)
        void this.runTaskQueue()

        return task
    }

    static async runTaskQueue() {
        for (const task of this.taskQueue) {
            try {
                await task.run()
            } catch (error) {
                //handleResultsError(error)
            }
        }
    }
}
