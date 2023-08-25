import { OutgoingHttpHeaders } from 'http'

import memoize from 'lodash/memoize'
import fetch from 'node-fetch'
import { AbortSignal } from 'node-fetch/externals'
import { stringify } from 'qs'

import { Tag } from '../stores/TagsStore'
import { CollectionData, DocumentData, Limits, User } from '../Types'

import buildSearchQuery, { FieldList, SearchFields } from './buildSearchQuery'

import type { SearchQueryParams, SearchQueryType } from '../Types'

const { API_URL } = process.env

const prefix = '/api/v1/'

interface FetchOptions {
    headers?: OutgoingHttpHeaders
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string
    signal?: AbortSignal
}

type PathPart = string | Record<string, string | boolean> | undefined

export const buildUrl = (...paths: PathPart[]) => {
    const queryObj = paths.reduce((prev, curr, index) => {
        if (typeof curr !== 'string' && typeof curr === 'object' && curr !== null) {
            paths.splice(index, 1)
            return Object.assign(prev || {}, curr)
        }
    }, undefined)
    return [prefix, ...paths].join('/').replace(/\/+/g, '/') + (queryObj ? `?${stringify(queryObj)}` : '')
}

export const fetchJson = <T>(url: string, opts: FetchOptions = {}) => {
    const fetchUrl = (typeof window === 'undefined' ? API_URL : '') + url
    const fetchInit = {
        ...opts,
        timeout: 100000,
        headers: {
            ...(opts.headers || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    }

    const min = process.env.API_RETRY_DELAY_MIN as unknown as number
    const max = process.env.API_RETRY_DELAY_MAX as unknown as number
    const maxRetryCount = process.env.API_RETRY_COUNT as unknown as number

    let retryCounter = 0
    const retryDelay = () => min + (retryCounter / (maxRetryCount - 1)) * (max - min)

    return new Promise<T>((resolve, reject) => {
        const fetchFn = () =>
            fetch(fetchUrl, fetchInit)
                .then((res) => {
                    if (res.ok) {
                        if (res.status === 204) {
                            resolve(true as T)
                        } else {
                            resolve(res.json())
                        }
                    } else {
                        if (retryCounter >= maxRetryCount) {
                            reject(`status (${res.status}) -> ${res.url}`)
                        }

                        retryCounter++
                        setTimeout(fetchFn, retryDelay())
                    }
                })
                .catch((reason) => reject(reason))

        void fetchFn()
    })
}

/*
 called only by node.js
 */
export const whoami = (headers: OutgoingHttpHeaders): Promise<User> => fetchJson(buildUrl('whoami'), { headers })
export const limits = (headers: OutgoingHttpHeaders): Promise<Limits> => fetchJson(buildUrl('limits'), { headers })
export const collections = (headers: OutgoingHttpHeaders): Promise<CollectionData[]> => fetchJson(buildUrl('collections'), { headers })
export const searchFields = (headers: OutgoingHttpHeaders): Promise<{ fields: SearchFields }> => fetchJson(buildUrl('search_fields'), { headers })
export const search = async (
    headers: OutgoingHttpHeaders,
    params: SearchQueryParams,
    type: SearchQueryType,
    fieldList: FieldList,
    missing: boolean,
    refresh: boolean,
    async: boolean,
    searchFields: SearchFields,
    uuid: string
) =>
    fetchJson(buildUrl(async ? 'async_search' : 'search', { refresh }), {
        headers,
        method: 'POST',
        body: JSON.stringify(buildSearchQuery(params, type, fieldList, missing, searchFields, uuid)),
    })

/*
 called only by browser
 */
export const doc = memoize(
    (docUrl, pageIndex = 1): Promise<DocumentData> => fetchJson(buildUrl(docUrl, 'json', { children_page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`
)

export const locations = memoize(
    (docUrl, pageIndex) => fetchJson(buildUrl(docUrl, 'locations', { page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`
)

export const tags = (docUrl: string): Promise<Tag[]> => fetchJson(buildUrl(docUrl, 'tags'))

export const tag = (docUrl: string, tagId: string): Promise<Tag> => fetchJson(buildUrl(docUrl, 'tags', tagId))

export const createTag = (docUrl: string, data: Pick<Tag, 'tag' | 'public'>): Promise<Tag> =>
    fetchJson(buildUrl(docUrl, 'tags'), {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const updateTag = (docUrl: string, tagId: string, data: Pick<Tag, 'public'>): Promise<Tag> =>
    fetchJson(buildUrl(docUrl, 'tags', tagId), {
        method: 'PATCH',
        body: JSON.stringify(data),
    })

export const deleteTag = (docUrl: string, tagId: string) => fetchJson(buildUrl(docUrl, 'tags', tagId), { method: 'DELETE' })

export const batch = (query: SearchQueryParams) =>
    fetchJson(buildUrl('batch'), {
        method: 'POST',
        body: JSON.stringify(query),
    })

export const collectionsInsights = (): Promise<CollectionData[]> => fetchJson(buildUrl('collections'))

export const getUploads = () => fetchJson(buildUrl('get_uploads'))

export const getDirectoryUploads = (collection: string, directoryId: string) => fetchJson(buildUrl(collection, directoryId, 'get_directory_uploads'))

export interface LogError {
    error: string
    info: string
    url: string
}

export const logError = (error: LogError) =>
    fetch('/api/save-error', {
        method: 'POST',
        body: JSON.stringify(error),
    })

export const fetchPdfTextContent = (url: string) => fetch('/api/get-pdf?' + new URLSearchParams({ url }))

/*
 URL building only
 */
export const createDownloadUrl = (docUrl: string, filename: string) => buildUrl(docUrl, 'raw', filename)
export const createPreviewUrl = (docUrl: string) => buildUrl(docUrl, 'pdf-preview')
export const createOcrUrl = (docUrl: string, tag: string) => buildUrl(docUrl, 'ocr', tag)
export const createThumbnailSrc = (docUrl: string, size: number) => buildUrl(docUrl, 'thumbnail', `${size}.jpg`)
export const createThumbnailSrcSet = (docUrl: string) =>
    `${createThumbnailSrc(docUrl, 100)}, ` + `${createThumbnailSrc(docUrl, 200)} 2x, ` + `${createThumbnailSrc(docUrl, 400)} 4x`
export const createUploadUrl = () => buildUrl('upload/')
