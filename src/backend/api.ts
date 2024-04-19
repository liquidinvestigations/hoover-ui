import memoize from 'lodash/memoize'
import fetch, { Response, HeadersInit } from 'node-fetch'
import { AbortSignal } from 'node-fetch/externals'
import { stringify } from 'qs'

import { Tag } from '../stores/TagsStore'
import {
    BatchSearchQueryParams,
    BatchSearchResponse,
    CollectionData,
    DirectoryUploadsState,
    DocumentData,
    Limits,
    LocationsData,
    UploadsState,
    User,
} from '../Types'

import { SearchFields } from './buildSearchQuery'

const prefix = '/api/v1/'

if (window && typeof process === 'undefined') {
    // @ts-ignore
    window.process = {}
}
const { retryDelayMin, retryDelayMax, retryCount } = {
    retryDelayMin: process.env?.API_RETRY_DELAY_MIN || '500',
    retryDelayMax: process.env?.API_RETRY_DELAY_MAX || '10000',
    retryCount: process.env?.API_RETRY_COUNT || '4',
}

export const X_HOOVER_PDF_INFO = 'X-Hoover-PDF-Info'
export const X_HOOVER_PDF_SPLIT_PAGE_RANGE = 'X-Hoover-PDF-Split-Page-Range'
export const X_HOOVER_PDF_EXTRACT_TEXT = 'X-Hoover-PDF-Extract-Text'

interface FetchOptions {
    headers?: HeadersInit
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string
    signal?: AbortSignal
    maxRetryCount?: number
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

export const fetchWithHeaders = (url: string, opts: FetchOptions = {}): Promise<Response> => {
    const fetchInit = {
        ...opts,
        timeout: 100000,
        headers: {
            ...(opts.headers || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    }

    const min = parseInt(retryDelayMin)
    const max = parseInt(retryDelayMax)
    const maxRetryCount = opts.maxRetryCount ?? parseInt(retryCount)

    let retryCounter = 0
    const retryDelay = () => min + (retryCounter / (maxRetryCount - 1)) * (max - min)

    return new Promise((resolve, reject) => {
        const fetchFn = () =>
            fetch(url, fetchInit)
                .then((res) => {
                    if (res.ok) {
                        resolve(res)
                    } else {
                        if (retryCounter >= maxRetryCount) {
                            reject(`status (${res.status}) -> ${res.url}`)
                        } else {
                            retryCounter++
                            setTimeout(fetchFn, retryDelay())
                        }
                    }
                })
                .catch((reason) => reject(reason))

        void fetchFn()
    })
}

export const fetchJson = async <T>(url: string, opts: FetchOptions = {}): Promise<T> => {
    const response = await fetchWithHeaders(url, opts)
    if (response.status === 204) {
        return true as T
    } else {
        return await response.json()
    }
}

export const whoami = (): Promise<User> => fetchJson(buildUrl('whoami'))
export const limits = (): Promise<Limits> => fetchJson(buildUrl('limits'))
export const collections = (): Promise<CollectionData[]> => fetchJson(buildUrl('collections'))
export const searchFields = (): Promise<{ fields: SearchFields }> => fetchJson(buildUrl('search_fields'))

export const doc = memoize(
    (docUrl, pageIndex = 1): Promise<DocumentData> => fetchJson(buildUrl(docUrl, 'json', { children_page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`,
)

export const locations = memoize(
    (docUrl, pageIndex): Promise<LocationsData> => fetchJson(buildUrl(docUrl, 'locations', { page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`,
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

export const batch = (query: BatchSearchQueryParams): Promise<BatchSearchResponse> =>
    fetchJson(buildUrl('batch'), {
        method: 'POST',
        body: JSON.stringify(query),
    })

export const collectionsInsights = (): Promise<CollectionData[]> => fetchJson(buildUrl('collections'))

export const getUploads = (): Promise<UploadsState[]> => fetchJson(buildUrl('get_uploads'))

export const getDirectoryUploads = (collection: string, directoryId: string): Promise<DirectoryUploadsState> =>
    fetchJson(buildUrl(collection, directoryId, 'get_directory_uploads'))

export interface LogError {
    error: string
    info: string
    url: string
}

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
