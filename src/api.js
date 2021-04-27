import AbortController from 'abort-controller'

const ongoingRequests = {}

export const search = async params => {
    const { type, fieldList, cancel } = params
    const requestKey = `${type}-${Array.isArray(fieldList) ? fieldList.join('-') : fieldList}`

    if (ongoingRequests[requestKey]) {
        ongoingRequests[requestKey].abort()
        delete ongoingRequests[requestKey]

        if (cancel) {
            throw { name: 'AbortError' }
        }
    }

    const controller = new AbortController()
    const signal = controller.signal
    ongoingRequests[requestKey] = controller

    const res = await fetch('/api/search', {
        signal,
        method: 'POST',
        body: JSON.stringify(params),
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
