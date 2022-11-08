import AbortController from 'abort-controller'

const ongoingRequests = {}
const retryCount = {}

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const search = async (params) => {
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

    retryCount[requestKey] = 0

    const makeRequest = async () =>
        fetch('/api/search', {
            signal,
            method: 'POST',
            body: JSON.stringify(params),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })

    let res = await makeRequest()

    while (!res.ok && retryCount[requestKey] < process.env.MAX_SEARCH_RETRIES) {
        await timeout(process.env.SEARCH_RETRY_DELAY)
        retryCount[requestKey] += 1
        res = await makeRequest()
    }

    delete ongoingRequests[requestKey]
    delete retryCount[requestKey]

    if (res.ok) {
        return res.json()
    } else {
        const json = await res.json()
        const message = json.reason || json.message || `HTTP ${res.status} ${res.statusText}`

        throw { message }
    }
}
