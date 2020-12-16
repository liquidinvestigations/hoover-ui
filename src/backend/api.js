import fetch from 'node-fetch'
import { stringify } from 'qs'
import memoize from 'lodash/memoize'
import buildSearchQuery from './buildSearchQuery'

const { API_URL } = process.env

const prefix = '/api/v0/'

const buildUrl = (...paths) => {
    const queryObj = paths.reduce((prev, curr, index) => {
        if (typeof curr !== 'string' && typeof curr === 'object' && curr !== null) {
            paths.splice(index, 1)
            return Object.assign(prev || {}, curr)
        }
    }, undefined)
    return [prefix, ...paths].join('/').replace(/\/+/g, '/')
        + (queryObj ? `?${stringify(queryObj)}` : '')
}

const fetchJson = async (url, opts = {}) => {
    const res = await fetch((typeof window === 'undefined' ? API_URL : '') + url, {
        ...opts,
        timeout: 60000,
        headers: {
            ...(opts.headers || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    if (res.ok) {
        return res.json();
    } else {
        throw await res.json()
    }
}

/*
 called only by node.js
 */
export const whoami = headers => fetchJson(buildUrl('whoami'), { headers })
export const limits = headers => fetchJson(buildUrl('limits'), { headers })
export const collections = headers => fetchJson(buildUrl('collections'), { headers })
export const search = (headers, params, type) => fetchJson(buildUrl('search'), {
    headers,
    method: 'POST',
    body: JSON.stringify(buildSearchQuery(params, type)),
})

/*
 called only by browser
 */
export const doc = memoize((docUrl, pageIndex = 1) => fetchJson(
    buildUrl(docUrl, 'json', { children_page: pageIndex })
), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`)

export const locations = memoize((docUrl, pageIndex) => fetchJson(
    buildUrl(docUrl, 'locations', { page: pageIndex })
), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`)

export const batch = query => fetchJson(buildUrl('batch'), {
    method: 'POST',
    body: JSON.stringify(query),
})

/*
 URL building only
 */
export const createDownloadUrl = (docUrl, filename) => buildUrl(docUrl, 'raw', filename)
export const createOcrUrl = (docUrl, tag) => buildUrl(docUrl, 'ocr', tag)
