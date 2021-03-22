export const fetchJson = async (url, opts = {}) => {
    const res = await fetch(url, {
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
        const json = await res.json()
        const message = json.reason || json.message || `HTTP ${res.status} ${res.statusText}`

        throw { message }
    }
}

export const search = params => fetchJson('/api/search', {
    method: 'POST',
    body: JSON.stringify(params),
})

export const aggregations = params => fetchJson('/api/aggregations', {
    method: 'POST',
    body: JSON.stringify(params),
})

export const tagsAggregations = params => fetchJson('/api/tagsAggregations', {
    method: 'POST',
    body: JSON.stringify(params),
})
