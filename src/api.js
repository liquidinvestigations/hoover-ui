import memoize from 'lodash/memoize'

const api = {
    fetchJson: async (url, params, opts = {}) => {
        let apiUrl = url
        if (params) {
            apiUrl += '?' + new URLSearchParams(params)
        }
        const res = await fetch(apiUrl, {
            ...opts,
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })

        if (res.ok) {
            return res.json()
        } else {
            throw await res.json()
        }
    },

    doc: memoize((docUrl, pageIndex = 1) => api.fetchJson(
        '/api/doc', { docUrl, pageIndex }
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    locations: memoize((docUrl, pageIndex) => api.fetchJson(
        '/api/locations', { docUrl, pageIndex }
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    search: params => api.fetchJson('/api/search', null, {
        method: 'POST',
        body: JSON.stringify(params),
    }),

    aggregations: params => api.fetchJson('/api/aggregations', null, {
        method: 'POST',
        body: JSON.stringify(params),
    }),
}

export default api
