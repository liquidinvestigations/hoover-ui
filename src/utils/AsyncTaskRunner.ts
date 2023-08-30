import events from 'missing-dom-events'
import { AbortSignal } from 'node-fetch/externals'

import { buildUrl, fetchJson } from '../backend/api'
import buildSearchQuery, { SearchFields } from '../backend/buildSearchQuery'
import { AsyncTaskData, SearchQueryParams, SearchQueryType, SourceField } from '../Types'

export class AsyncQueryTask extends EventTarget {
    isRunning: boolean = false
    initialEta?: number
    data?: AsyncTaskData

    private timeout?: NodeJS.Timeout
    private controller?: AbortController

    constructor(
        readonly query: SearchQueryParams,
        private readonly type: SearchQueryType,
        private readonly fieldList: SourceField[] | '*',
        private readonly searchFields: SearchFields,
        private readonly uuid: string
    ) {
        super()
    }

    async run() {
        if (!this.isRunning) {
            this.isRunning = true

            this.controller = new AbortController()
            const signal = this.controller.signal as AbortSignal

            this.data = await fetchJson<AsyncTaskData>(buildUrl('async_search'), {
                signal,
                method: 'POST',
                body: JSON.stringify(
                    buildSearchQuery(
                        this.query,
                        this.type === 'missing' ? 'aggregations' : this.type,
                        this.fieldList,
                        this.type === 'missing',
                        this.searchFields,
                        this.uuid
                    )
                ),
            })

            this.initialEta = this.data.eta.total_sec
            this.dispatchEvent(new events.CustomEvent('eta', { detail: this.data.eta.total_sec }))

            if (this.data?.status == 'done') {
                this.isRunning = false
                AsyncQueryTaskRunner.runTaskQueue()
            } else {
                void this.handleQueryResult()
            }
        }
    }

    abort() {
        if (this.isRunning) {
            this.controller?.abort()
            clearTimeout(this.timeout)
            this.isRunning = false
        }
    }

    async handleQueryResult() {
        if (!this.data || !this.initialEta) return

        const wait = (this.data.eta.total_sec as number) < parseInt(process.env.ASYNC_SEARCH_POLL_INTERVAL as string)

        this.controller = new AbortController()
        const signal = this.controller.signal as AbortSignal

        this.data = await fetchJson<AsyncTaskData>(buildUrl('async_search', this.data.task_id, { wait }), { signal })
        this.dispatchEvent(new events.CustomEvent('eta', { detail: this.data.eta.total_sec }))

        if (this.data.status == 'done') {
            this.isRunning = false
            AsyncQueryTaskRunner.runTaskQueue()
        } else {
            if (Date.now() - Date.parse(this.data.date_created) < this.timeoutMs) {
                this.timeout = setTimeout(this.handleQueryResult, parseInt(process.env.ASYNC_SEARCH_POLL_INTERVAL as string) * 1000)
            } else {
                this.dispatchEvent(new events.ErrorEvent('error', { message: 'Results task ETA timeout' }))
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

    static createAsyncQueryTask(
        query: SearchQueryParams,
        type: SearchQueryType,
        fieldList: SourceField[] | '*',
        searchFields: SearchFields,
        uuid: string
    ): AsyncQueryTask {
        const task = new AsyncQueryTask(query, type, fieldList, searchFields, uuid)

        this.taskQueue.push(task)
        this.runTaskQueue()

        return task
    }

    static runTaskQueue() {
        for (const task of this.taskQueue) {
            if (task.data?.status === 'done') {
                this.clearTask(task)
                task.dispatchEvent(new events.CustomEvent('done', { detail: task.data }))
            }
        }

        for (const task of this.taskQueue) {
            if (this.taskQueue.filter((task) => task.isRunning).length < (process.env.ASYNC_SEARCH_POLL_SIZE as unknown as number)) {
                task.run().catch((error) => {
                    this.clearTask(task)
                    task.dispatchEvent(new events.ErrorEvent('error', { message: error }))
                })
            }
        }
    }

    static clearTask(task: AsyncQueryTask) {
        this.taskQueue.splice(this.taskQueue.indexOf(task), 1)
    }

    static clearQueue() {
        for (const task of this.taskQueue) {
            task.abort()
        }
        this.taskQueue = []
    }
}
