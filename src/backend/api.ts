import { OutgoingHttpHeaders } from 'http'

import memoize from 'lodash/memoize'
import fetch from 'node-fetch'
import { stringify } from 'qs'

import { Tag } from '../stores/TagsStore'

import buildSearchQuery, { FieldList, SearchFields } from './buildSearchQuery'

import type { SearchQueryParams, SearchQueryType } from '../Types'

const { API_URL } = process.env

const prefix = '/api/v1/'

interface FetchOptions {
    headers?: OutgoingHttpHeaders
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string
}

type PathPart = string | Record<string, string | boolean> | undefined

const buildUrl = (...paths: PathPart[]) => {
    const queryObj = paths.reduce((prev, curr, index) => {
        if (typeof curr !== 'string' && typeof curr === 'object' && curr !== null) {
            paths.splice(index, 1)
            return Object.assign(prev || {}, curr)
        }
    }, undefined)
    return [prefix, ...paths].join('/').replace(/\/+/g, '/') + (queryObj ? `?${stringify(queryObj)}` : '')
}

const fetchJson = async (url: string, opts: FetchOptions = {}) => {
    const res = await fetch((typeof window === 'undefined' ? API_URL : '') + url, {
        ...opts,
        timeout: 100000,
        headers: {
            ...(opts.headers || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    if (res.ok) {
        if (res.status === 204) {
            return true
        }
        return res.json()
    } else {
        throw res
    }
}

/*
 called only by node.js
 */
export const whoami = (headers: OutgoingHttpHeaders) => fetchJson(buildUrl('whoami'), { headers })
export const limits = (headers: OutgoingHttpHeaders) => fetchJson(buildUrl('limits'), { headers })
export const collections = (headers: OutgoingHttpHeaders) => fetchJson(buildUrl('collections'), { headers })
export const searchFields = (headers: OutgoingHttpHeaders) => fetchJson(buildUrl('search_fields'), { headers })
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
    (docUrl, pageIndex = 1) => fetchJson(buildUrl(docUrl, 'json', { children_page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`
)

export const locations = memoize(
    (docUrl, pageIndex) => fetchJson(buildUrl(docUrl, 'locations', { page: pageIndex })),
    (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`
)

export const tags = (docUrl: string) => fetchJson(buildUrl(docUrl, 'tags'))

export const tag = (docUrl: string, tagId: string) => fetchJson(buildUrl(docUrl, 'tags', tagId))

export const createTag = (docUrl: string, data: Pick<Tag, 'tag' | 'public'>) =>
    fetchJson(buildUrl(docUrl, 'tags'), {
        method: 'POST',
        body: JSON.stringify(data),
    })

export const updateTag = (docUrl: string, tagId: string, data: Pick<Tag, 'public'>) =>
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

export const collectionsInsights = () => fetchJson(buildUrl('collections'))

export const getUploads = () => fetchJson(buildUrl('get_uploads'))

export const getDirectoryUploads = (collection: string, directoryId: string) => fetchJson(buildUrl(collection, directoryId, 'get_directory_uploads'))

export const asyncSearch = (uuid: string, wait: boolean) => fetchJson(buildUrl('async_search', uuid, { wait }))

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
